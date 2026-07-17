import type { OTPMessage, OTPResponse } from "../types";

// --- Part 1: OTP page detection --------------------------------------------

const OTP_SIGNALS = {
  inputPatterns: [
    'input[autocomplete="one-time-code"]',
    'input[name*="otp" i]',
    'input[id*="otp" i]',
    'input[placeholder*="otp" i]',
    'input[name*="code" i]',
    'input[id*="code" i]',
    'input[placeholder*="code" i]',
  ],
  textPatterns: [
    /enter.*(?:otp|code)/i,
    /(?:verify|verification).*code/i,
    /one.time.*password/i,
    /check.*(?:email|inbox).*code/i,
    /\d+[-\s]*digit.*code/i,
  ],
};

function isOTPPage(): boolean {
  const hasMatchingInput = OTP_SIGNALS.inputPatterns.some(
    (selector) => document.querySelector(selector) !== null
  );
  if (hasMatchingInput) return true;

  const bodyText = document.body?.innerText ?? "";
  return OTP_SIGNALS.textPatterns.some((pattern) => pattern.test(bodyText));
}

// --- Part 2: Button injection -----------------------------------------------

const BUTTON_ID = "otp-autofill-button";
const DEFAULT_BUTTON_TEXT = "⚡ Auto-fill OTP";

function injectOTPButton(): void {
  if (document.getElementById(BUTTON_ID)) return;

  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  button.textContent = DEFAULT_BUTTON_TEXT;
  button.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999999;
    background: #4f46e5;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
  `;

  button.addEventListener("click", () => handleButtonClick(button));
  document.body.appendChild(button);
}

async function handleButtonClick(button: HTMLButtonElement): Promise<void> {
  button.textContent = "⏳ Reading mail...";

  try {
    const message: OTPMessage = {
      type: "FETCH_OTP",
      domain: window.location.hostname,
    };
    const response: OTPResponse = await chrome.runtime.sendMessage(message);

    if (response?.otp) {
      fillOTP(response.otp);
      button.textContent = "✅ Filled!";
      setTimeout(() => button.remove(), 2000);
    } else {
      button.textContent = "❌ Not found";
      setTimeout(() => {
        button.textContent = DEFAULT_BUTTON_TEXT;
      }, 2000);
    }
  } catch {
    button.textContent = "❌ Not found";
    setTimeout(() => {
      button.textContent = DEFAULT_BUTTON_TEXT;
    }, 2000);
  }
}

// --- Part 3: Fill OTP --------------------------------------------------------

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  "value"
)?.set;

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0)
  );
}

function setNativeValue(input: HTMLInputElement, value: string): void {
  nativeInputValueSetter?.call(input, value);
}

function fillOTP(otp: string): void {
  const digits = otp.split("");

  // Case 1: one input per digit.
  const singleDigitInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[maxlength="1"]')
  ).filter(isVisible);

  if (singleDigitInputs.length === digits.length) {
    singleDigitInputs.forEach((input, i) => {
      const digit = digits[i];
      input.focus();
      input.dispatchEvent(new KeyboardEvent("keydown", { key: digit, bubbles: true }));
      setNativeValue(input, digit);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent("keyup", { key: digit, bubbles: true }));
    });
    return;
  }

  // Case 2: single input for the full code.
  const candidateInput = OTP_SIGNALS.inputPatterns
    .map((selector) => document.querySelector<HTMLInputElement>(selector))
    .find((el): el is HTMLInputElement => !!el && isVisible(el));

  if (candidateInput) {
    candidateInput.focus();
    setNativeValue(candidateInput, otp);
    candidateInput.dispatchEvent(new Event("input", { bubbles: true }));
    candidateInput.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  // Case 3: contenteditable field.
  const editable = document.querySelector<HTMLElement>('[contenteditable="true"]');
  if (editable) {
    editable.focus();
    editable.innerText = otp;
    editable.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

// --- Part 4: Init + SPA support ----------------------------------------------

function init(): void {
  if (isOTPPage()) {
    injectOTPButton();
  }
}

init();

const observer = new MutationObserver(() => {
  init();
});

observer.observe(document.body, { childList: true, subtree: true });
