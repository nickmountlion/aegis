# Security Policy

## Supported Scope

This repository (`nickmountlion/aegis`) is the open-core reference implementation of **AEGIS AI**. Security fixes apply to the `main` branch across:

- `aegis-scanner` (static secret and vulnerability pattern engine)
- `aegis-compliance` (ISO/IEC 27001:2022 control mapping and report generators)
- `aegis-cli` (CLI entrypoint and local dashboard HTTP server)
- `aegis-dashboard` (static browser UI assets)

## Reporting a Vulnerability

Please **do not** open public GitHub issues for suspected security vulnerabilities, including path-traversal, XSS in generated HTML reports, or unsafe local server bindings.

1. Report privately via GitHub Security Advisories (**Security -> Advisories -> Report a vulnerability**) on `nickmountlion/aegis`, or contact the repository maintainer directly.
2. Include steps to reproduce, affected file/module, and potential impact.
3. Expect an acknowledgment within **3 business days** and a remediation plan or status update within **7 business days**.

## Operational & Fixture Disclaimers

- **Local Dashboard Binding:** `aegis dashboard` is designed for local workstation use (`http://localhost:3000`) and should not be exposed directly to untrusted networks without authentication and TLS.
- **Synthetic Test Fixtures:** Files under `mock-project/` intentionally contain fake credentials and vulnerable patterns (such as the standard AWS documentation example key `AKIAIOSFODNN7EXAMPLE`) solely for scanner self-testing. Do not deploy `mock-project/` in production.
- **No Real Secrets:** This repository must never contain production credentials, private keys, or client-specific identifiers.
