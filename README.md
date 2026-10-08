# OTP Autofill

A Chrome extension that reads recent OTP/verification emails from Gmail
and automatically fills verification codes into supported web forms.

## Features

- Sign in with Google
- Connect multiple Gmail accounts
- Read recent verification emails
- Detect OTP/verification pages
- Extract OTP codes automatically
- Fill single-input OTP fields
- Fill multi-input OTP fields
- Support contenteditable OTP fields
- Persistent extension settings
- Optional automatic OTP detection
- Optional automatic form submission

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Chrome Extension Manifest V3
- Gmail API
- Chrome Identity API
- Chrome Storage API

## Project Structure

src/
├── App.tsx # Extension popup UI
├── main.tsx # React entry point
├── index.css # Global styles
├── background/
│ └── index.ts # Gmail API + OTP extraction
├── content/
│ └── index.ts # OTP page detection + autofill
└── types/
└── index.ts # Shared TypeScript types

manifest.json # Chrome extension configuration
vite.config.ts # Vite + CRXJS configuration
package.json # Dependencies and scripts

## Requirements

- Node.js
- npm
- Google account
- Chrome/Chromium browser

## Installation

Clone the repository:

git clone <repository-url>
cd otp-autofiller

Install dependencies:

npm install

## Development

Start the Vite development server:

npm run dev

For extension development, build the extension:

npm run build

The production extension is generated in the Vite build output directory.

## Load Extension in Chrome

1. Run `npm install`.
2. Run `npm run build`.
3. Open `chrome://extensions`.
4. Enable Developer mode.
5. Select "Load unpacked".
6. Select the generated extension/build directory.
7. Open the extension.
8. Sign in with Google.
9. Open a website that requires an OTP.
10. Use the "Auto-fill OTP" button.

## Gmail Permissions

The extension requests Gmail read-only access:

https://www.googleapis.com/auth/gmail.readonly

It also requests Google profile/email information for account management.

The extension uses Chrome Identity to obtain the OAuth token and Gmail API
to retrieve recent messages.

## How It Works

1. The content script detects whether the current page appears to contain
   an OTP/verification form.
2. If detected, it injects an "Auto-fill OTP" button.
3. Clicking the button sends a message to the background service worker.
4. The background worker obtains a Google authentication token.
5. Gmail is searched for recent OTP/verification messages.
6. The latest matching email is retrieved.
7. The email body is decoded.
8. OTP extraction patterns search for a valid 4–8 character code.
9. The extracted code is returned to the content script.
10. The content script fills the OTP field.

## Available Commands

npm run dev # Start development server
npm run build # Type-check and build
npm run lint # Run ESLint
npm run preview # Preview Vite build

## Security

The extension requests Gmail read-only access. OAuth credentials and
permissions should be configured carefully before production release.

Before publishing, review:

- OAuth consent configuration
- Chrome Web Store permissions
- Gmail API usage
- Token handling
- Content-script permissions
- Privacy policy
- Sensitive-data handling

## Limitations

The current implementation searches recent Gmail messages using broad
OTP-related keywords and currently does not use the website domain to
narrow the Gmail search.

OTP extraction is pattern-based, so some email formats may not be
recognized.

## Future Improvements

- Domain-aware email matching
- Better OTP extraction
- Sender/domain verification
- Automatic OTP filling without button interaction
- Configurable search duration
- Better support for React-controlled inputs
- Improved iframe support
- OTP expiration detection
- Gmail API error/retry handling
- Stronger security/privacy controls
- Automated tests
