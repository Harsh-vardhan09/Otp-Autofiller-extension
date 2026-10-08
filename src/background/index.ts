import type { OTPMessage, OTPResponse, StorageData } from "../types";

interface GetSelectedAccountMessage {
  type: "GET_SELECTED_ACCOUNT";
}

type IncomingMessage = OTPMessage | GetSelectedAccountMessage;

interface GmailMessagePart {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: GmailMessagePart[];
}

interface GmailMessage {
  id: string;
  payload?: GmailMessagePart;
}

interface GmailMessageListResponse {
  messages?: { id: string; threadId: string }[];
}

const OTP_PATTERNS: RegExp[] = [
  /(?:otp|code|pin)\s*(?:is|:)?\s*([\da-z\s-]{4,}?)(?:\s|$|\.)/i,
  /([\da-z\s-]{4,}?)\s+is your (?:verification|otp|one-time)/i,
  /^\s*([\da-z\s-]{4,}?)\s*$/m,
  /use\s+(?:code|otp)\s*:?\s*([\da-z\s-]{4,}?)(?:\s|$|\.)/i,
  /([\da-z\s-]{4,})/i,
];

function extractOTPFromText(text: string): string | null {
  for (const pattern of OTP_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const cleaned = match[1].replace(/[\s-]/g, "").toUpperCase();
      if (/^[A-Z0-9]{4,8}$/.test(cleaned)) return cleaned;
    }
  }
  return null;
}

function findPlainTextPart(part?: GmailMessagePart): GmailMessagePart | null {
  if (!part) return null;
  // If this part is text/plain, return it
  if (part.mimeType === "text/plain" && part.body?.data) return part;
  // If this part is text/html (fallback), keep it for later
  if (part.mimeType === "text/html" && part.body?.data) return part;
  // Otherwise search in children
  for (const child of part.parts ?? []) {
    const found = findPlainTextPart(child);
    if (found) return found;
  }
  return null;
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

function getAuthToken(interactive: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(
          new Error(
            chrome.runtime.lastError?.message ?? "Failed to get auth token",
          ),
        );
        return;
      }
      resolve(token as string);
    });
  });
}

async function gmailFetch<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Gmail API request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchOtpForDomain(_domain: string): Promise<OTPResponse> {
  try {
    const token = await getAuthToken(true);
    console.log("[OTP] Got auth token");

    // Search for most recent email with OTP keywords, ignore domain
    const query = `newer_than:30m (subject:OTP OR subject:"verification code" OR subject:"one-time" OR subject:"verify" OR subject:code)`;
    console.log("[OTP] Search query:", query);

    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${new URLSearchParams(
      { q: query, maxResults: "10" },
    )}`;

    const list = await gmailFetch<GmailMessageListResponse>(listUrl, token);
    console.log("[OTP] Messages found:", list.messages?.length);

    const firstId = list.messages?.[0]?.id;
    if (!firstId) {
      console.log("[OTP] No OTP emails found in recent 30 minutes");
      return { otp: null };
    }

    const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${firstId}?format=full`;
    const message = await gmailFetch<GmailMessage>(detailUrl, token);
    console.log("[OTP] Got message:", message.id);

    const textPart = findPlainTextPart(message.payload);
    if (!textPart?.body?.data) {
      console.log("[OTP] No text/HTML part found");
      return { otp: null };
    }

    console.log("[OTP] Part type:", textPart.mimeType);
    const bodyText = decodeBase64Url(textPart.body.data);
    console.log("[OTP] Email body:", bodyText.substring(0, 300));

    const otp = extractOTPFromText(bodyText);
    console.log("[OTP] Extracted OTP:", otp);

    return { otp };
  } catch (error) {
    console.error("[OTP] Error:", error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener(
  (message: IncomingMessage, _sender, sendResponse) => {
    if (message?.type === "FETCH_OTP") {
      fetchOtpForDomain(message.domain)
        .then((response) => sendResponse(response))
        .catch((error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch OTP";
          sendResponse({
            otp: null,
            error: errorMessage,
          } satisfies OTPResponse);
        });
      return true;
    }

    if (message?.type === "GET_SELECTED_ACCOUNT") {
      chrome.storage.local.get("selectedId", (data: Partial<StorageData>) => {
        sendResponse(data.selectedId ?? null);
      });
      return true;
    }

    return true;
  },
);
