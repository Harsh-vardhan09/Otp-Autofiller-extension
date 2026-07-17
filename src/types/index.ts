export type AvatarColor = "blue" | "pink" | "amber";

export interface Account {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarColor: AvatarColor;
}

export interface Settings {
  autoDetect: boolean;
  searchWindow: boolean;
  autoSubmit: boolean;
}

export interface OTPMessage {
  type: "FETCH_OTP";
  domain: string;
}

export interface OTPResponse {
  otp: string | null;
  error?: string;
}

export interface StorageData {
  accounts: Account[];
  selectedId: string;
  settings: Settings;
}
