# Security Policy

## Supported Versions

Only the latest major release (`3.0.x`) on the `main` branch actively receives security updates and patches.

| Version | Supported          |
| ------- | ------------------ |
| 3.0.x   | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please report suspected vulnerabilities privately using one of the following channels:

1. **GitHub Private Security Advisories (Preferred)**:
   Submit a report directly via [GitHub Security Advisories](https://github.com/gulshanhex/portfolio/security/advisories/new).
2. **Direct Email**:
   Send an email to **contact@gulshan-kumar.me** with the subject line `[SECURITY] Portfolio CMS Vulnerability Report`.

### What to Include

To help us triage and resolve the issue quickly, please include:
- A clear description of the vulnerability and the affected file(s) or endpoint(s) (e.g., `/api/admin/...`, `/admin/login`, `/setup`, `/api/contact`).
- Step-by-step reproduction instructions or a minimal proof-of-concept request.
- The potential impact (e.g., authentication bypass, CSRF, XSS, SQL injection, rate-limit bypass).

### Response Timeline

- **Initial Acknowledgment**: Within 48 hours of receiving your report.
- **Status Update & Triage**: Within 5 business days.
- **Fix & Coordinated Disclosure**: Once a fix is verified and released, we will credit you in the security advisory (unless you prefer to remain anonymous).

## Built-In Security Controls

For context when auditing this repository:
- **Zero Secrets in Repository**: No secrets or tokens are stored in `wrangler.jsonc` or `wrangler.toml`. All sensitive values (`SESSION_SECRET`, `ADMIN_SETUP_TOKEN`, `ADMIN_ACCESS_KEY`, `ADMIN_TOTP_SECRET`) are read at runtime from Cloudflare Worker Secrets via `src/lib/env.ts`.
- **Password Hashing**: Admin passwords use WebCrypto `PBKDF2-SHA256` with 100,000 iterations and per-user random salts (`src/lib/auth.ts`).
- **Session & CSRF Protection**: Admin sessions use `HttpOnly`, `SameSite=Strict`, HMAC-SHA256 signed cookies plus per-session cryptographic `X-CSRF-Token` validation on all mutating (`POST`, `PUT`, `DELETE`, `PATCH`) requests.
- **Two-Factor Authentication**: Supports RFC 6238 TOTP 2FA (Google Authenticator / Authy) via database secret or Worker-enforced `ADMIN_TOTP_SECRET`.
- **HTML Sanitization**: Public content fields that allow basic formatting pass through `sanitizeBasicHtml()` (`<strong>`, `<em>`, `<br>` only; all other tags and attributes are escaped).
