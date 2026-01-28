# AutoVault Security Documentation

This document provides a comprehensive overview of the security features and architectural safeguards implemented in the AutoVault platform.

## 1. Authentication & Session Management

- **JWT (JSON Web Token) Authentication**: Secure, stateless authentication using signed tokens for API access.
- **Secure HttpOnly Cookies**: JWT tokens are stored in `HttpOnly` cookies to prevent client-side script access, mitigating XSS-based token theft.
- **SameSite Cookie Policy**: Cookies use `SameSite: Lax` to provide protection against Cross-Site Request Forgery (CSRF).
- **Token Blacklisting**: Implemented a server-side blacklist for tokens upon logout to ensure sessions are truly terminated and cannot be reused.
- **Login Tracking**: Captures login timestamps and IP addresses to monitor for suspicious account activity.

## 2. Authorization & Access Control (RBAC)

- **Role-Based Access Control**: Granular permissions system with two primary roles: `Admin` and `Normal User`.
- **Backend Route Guards**: Custom `isAdmin` and `isUser` middlewares protect sensitive API endpoints.
- **Frontend Route Protection**: Secure routing on the frontend prevents unauthorized access to management dashboards and user-specific pages.

## 3. Multi-Factor Authentication (MFA)

- **Tiered MFA Support**: Users can choose between two levels of secondary verification:
  - **Email-based OTP**: A 6-digit code sent to the registered email address.
  - **TOTP (Authenticator Apps)**: Support for Google Authenticator/Authy via QR code setup.
- **Backup Codes**: Generators provided for disaster recovery when primary MFA devices are lost.
- **MFA Challenge Flow**: Integrated directly into the login pipeline, ensuring high-risk accounts are protected by more than just a password.

## 4. Advanced Threat Protection

- **Payload Guard (Custom IDS)**:
  - Real-time scanning of all incoming request data (Body, Query, Params) for malicious patterns.
  - Detects XSS script tags, SQL/NoSQL injection indicators, and event handlers (e.g., `onerror`, `onload`).
  - **Automatic Violation Enforcement**: Issues security warnings and automatically locks accounts for 20 minutes if multiple violations are detected.
- **Global Input Sanitization**: Uses the `xss` library to strip malicious code from all user-contributed content before it reaches the application logic.
- **Tiered Rate Limiting**:
  - `generalLimiter`: Protects overall API throughput.
  - `loginLimiter`: Prevents brute-force attacks on user credentials.
  - `registrationLimiter`: Limits mass account creation attempts.
  - `strictLimiter`: Highly restrictive limits for sensitive operations like MFA setup.

## 5. Security Headers & Infrastructure

- **Helmet.js Integration**: Automatically configures secure HTTP headers:
  - **CSP (Content Security Policy)**: Restricts where scripts, styles, and images can be loaded from.
  - **HSTS (HTTP Strict Transport Security)**: Enforces HTTPS connections.
  - **Frameguard**: Prevents Clickjacking by restricting framing (X-Frame-Options).
  - **Referrer-Policy**: Controls how much referrer information is shared with other sites.
- **CORS Whitelisting**: Strict origin checking to allow only trusted frontend domains to interact with the API.
- **SSL/TLS Support**: Ready for encrypted communication with built-in certificate management utilities.

## 6. Account & Password Policies

- **Robust Password Standards**: Enforces passwords between 8-32 characters, requiring uppercase, lowercase, and numeric characters.
- **Identity-Aware Validation**: Prevents users from using their username or email as part of their password.
- **Password History**: Stores a hash history of the last 5 passwords to prevent users from rotating through the same credentials.
- **Intelligent Account Locking**: Automatically locks accounts for 10 minutes after 5 failed login attempts to thwart automated brute-force tools.
- **Google reCAPTCHA v2**: Integrated into registration and login forms to distinguish between human users and automated bots.

## 7. Monitoring & Auditing

- **Audit Logging System**: 
  - Records every sensitive action (Login, Register, MFA Setup, Data Deletion).
  - Captures UserId, IP Address, Action Type, and Timestamp.
  - Dedicated Admin dashboard for security personnel to review audit trails.
- **Centralized Error Logging**: Detailed error tracking that includes the URL, Method, and IP to help identify and respond to active exploitation attempts.
