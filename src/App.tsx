import { useEffect, useState } from "react";
import type { Account, AvatarColor, Settings, StorageData } from "./types";

type Screen = "signin" | "accounts" | "settings";

const AVATAR_CYCLE: AvatarColor[] = ["blue", "pink", "amber"];

const AVATAR_CLASSES: Record<AvatarColor, string> = {
  blue: "bg-blue-100 text-blue-600",
  pink: "bg-pink-100 text-pink-600",
  amber: "bg-amber-100 text-amber-600",
};

const DEFAULT_SETTINGS: Settings = {
  autoDetect: true,
  searchWindow: true,
  autoSubmit: false,
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// --- Icons -----------------------------------------------------------------

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

// --- Shared UI -------------------------------------------------------------

function Header({
  showGear,
  onGear,
}: {
  showGear: boolean;
  onGear: () => void;
}) {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="text-sm font-semibold text-gray-900">
          OTP Autofill
        </span>
      </div>
      {showGear && (
        <button
          type="button"
          onClick={onGear}
          aria-label="Settings"
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <GearIcon className="h-5 w-5" />
        </button>
      )}
    </header>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-teal-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

// --- App -------------------------------------------------------------------

export default function App() {
  const [screen, setScreen] = useState<Screen>("signin");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted state on mount.
  useEffect(() => {
    chrome.storage.local.get(
      ["accounts", "selectedId", "settings"],
      (data: Partial<StorageData>) => {
        const loadedAccounts = data.accounts ?? [];
        setAccounts(loadedAccounts);
        setSelectedId(data.selectedId ?? loadedAccounts[0]?.id ?? "");
        setSettings({ ...DEFAULT_SETTINGS, ...(data.settings ?? {}) });
        setScreen(loadedAccounts.length > 0 ? "accounts" : "signin");
        setLoaded(true);
      },
    );
  }, []);

  // Persist on every change (after initial load).
  useEffect(() => {
    if (!loaded) return;
    const payload: StorageData = { accounts, selectedId, settings };
    chrome.storage.local.set(payload);
  }, [loaded, accounts, selectedId, settings]);

  const selectedAccount =
    accounts.find((a) => a.id === selectedId) ?? accounts[0] ?? null;

  async function handleSignIn() {
    setError(null);
    setBusy(true);
    try {
      const token = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (t) => {
          if (chrome.runtime.lastError || !t) {
            reject(
              new Error(chrome.runtime.lastError?.message ?? "Sign in failed"),
            );
            return;
          }
          resolve(t as string);
        });
      });

      const res = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load Google profile");
      const profile: { id?: string; email: string; name?: string } =
        await res.json();

      const name = profile.name ?? profile.email.split("@")[0];
      const id = profile.id ?? profile.email;

      setAccounts((prev) => {
        if (prev.some((a) => a.id === id)) {
          setSelectedId(id);
          return prev;
        }
        const account: Account = {
          id,
          name,
          email: profile.email,
          initials: initialsFromName(name),
          avatarColor: AVATAR_CYCLE[prev.length % AVATAR_CYCLE.length],
        };
        setSelectedId(id);
        return [...prev, account];
      });
      setScreen("accounts");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  function removeSelected() {
    if (!selectedAccount) return;
    setAccounts((prev) => {
      const next = prev.filter((a) => a.id !== selectedAccount.id);
      setSelectedId(next[0]?.id ?? "");
      if (next.length === 0) setScreen("signin");
      return next;
    });
  }

  function signOutAll() {
    setAccounts([]);
    setSelectedId("");
    setScreen("signin");
  }

  function updateSetting(key: keyof Settings, value: boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="flex min-h-[480px] w-[340px] flex-col bg-white text-gray-900">
      <Header
        showGear={screen !== "signin"}
        onGear={() => setScreen("settings")}
      />

      {screen === "signin" && (
        <SignInScreen busy={busy} error={error} onSignIn={handleSignIn} />
      )}

      {screen === "accounts" && (
        <AccountsScreen
          accounts={accounts}
          selectedId={selectedAccount?.id ?? ""}
          selectedEmail={selectedAccount?.email ?? ""}
          onSelect={setSelectedId}
          onAdd={handleSignIn}
          onRemove={removeSelected}
          busy={busy}
        />
      )}

      {screen === "settings" && (
        <SettingsScreen
          settings={settings}
          onChange={updateSetting}
          onBack={() => setScreen("accounts")}
          onSignOutAll={signOutAll}
        />
      )}
    </div>
  );
}

// --- Screens ---------------------------------------------------------------

function SignInScreen({
  busy,
  error,
  onSignIn,
}: {
  busy: boolean;
  error: string | null;
  onSignIn: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-8 text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
          <MailIcon className="h-8 w-8 text-teal-600" />
        </div>
        <h1 className="mt-5 text-lg font-semibold text-gray-900">
          Connect your Gmail
        </h1>
        <p className="mt-2 max-w-[240px] text-sm text-gray-500">
          Sign in with Google so OTP Autofill can read one-time codes and fill
          them for you automatically.
        </p>

        <button
          type="button"
          onClick={onSignIn}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleLogo className="h-5 w-5" />
          {busy ? "Connecting…" : "Sign in with Google"}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <p className="mt-6 max-w-[260px] text-xs leading-relaxed text-gray-400">
        We only read messages that contain verification codes. Your emails stay
        private and never leave your device.
      </p>
    </div>
  );
}

function AccountsScreen({
  accounts,
  selectedId,
  selectedEmail,
  onSelect,
  onAdd,
  onRemove,
  busy,
}: {
  accounts: Account[];
  selectedId: string;
  selectedEmail: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        <p className="px-1 pb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          Connected accounts
        </p>

        {accounts.map((account) => {
          const selected = account.id === selectedId;
          return (
            <button
              type="button"
              key={account.id}
              onClick={() => onSelect(account.id)}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                selected
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  AVATAR_CLASSES[account.avatarColor]
                }`}
              >
                {account.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-900">
                  {account.name}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {account.email}
                </span>
              </span>
              {selected && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                  <CheckIcon className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onAdd}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:opacity-60"
        >
          <PlusIcon className="h-4 w-4" />
          {busy ? "Connecting…" : "Add another account"}
        </button>
      </div>

      {selectedEmail && (
        <footer className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <span className="min-w-0 flex-1 truncate text-xs text-gray-500">
            Active: <span className="text-gray-700">{selectedEmail}</span>
          </span>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove account"
            className="ml-2 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </footer>
      )}
    </div>
  );
}

function SettingsScreen({
  settings,
  onChange,
  onBack,
  onSignOutAll,
}: {
  settings: Settings;
  onChange: (key: keyof Settings, value: boolean) => void;
  onBack: () => void;
  onSignOutAll: () => void;
}) {
  const rows: {
    key: keyof Settings;
    title: string;
    description: string;
  }[] = [
    {
      key: "autoDetect",
      title: "Auto-detect OTP fields",
      description: "Spot code inputs on pages automatically.",
    },
    {
      key: "searchWindow",
      title: "Recent messages only",
      description: "Only read emails from the last few minutes.",
    },
    {
      key: "autoSubmit",
      title: "Auto-submit after fill",
      description: "Submit the form once the code is filled.",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <BackIcon className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="flex-1 divide-y divide-gray-100 px-4">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-3 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{row.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{row.description}</p>
            </div>
            <Toggle
              checked={settings[row.key]}
              onChange={(value) => onChange(row.key, value)}
            />
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 p-4">
        <button
          type="button"
          onClick={onSignOutAll}
          className="w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Sign out of all accounts
        </button>
      </div>
    </div>
  );
}
