# Contributing

Thanks for helping out! ⭐ Starring the repo is appreciated.

## Setup

```sh
npm install
npm run dev     # then load dist/ as an unpacked extension in chrome://extensions
```

## Standards

- Branch from `main`; one focused change per PR.
- Commits follow `type: message` (`feat:`, `fix:`, `docs:`, `chore:`, `style:`).
- Run `npm run ci` before pushing (format check, lint, type-check + build).
  `npm run format` and `npm run lint:fix` fix most issues automatically; CI also does this on same-repo branches.
- Never commit real OTPs, emails, OAuth tokens or client secrets.
- Open an issue first for large changes, and fill in the PR template.
