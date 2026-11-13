# Kaizen Improvement Plan — `nickmountlion/aegis`

> Methodology: **Plan -> Run -> Measure -> Adjust** ([Kaizen Security Loop](https://github.com/nickmountlion/security-architecture-playbook/blob/main/process/kaizen-loop.md)).
> Scope: Branch `kaizen/2026-11` (local review; no push to `main`).

## 1. Baseline & Friction Hypotheses

Inspected `README.md`, `package.json`, `package-lock.json`, `test-run.js`, workspace packages (`aegis-cli`, `aegis-scanner`, `aegis-compliance`, `aegis-dashboard`), `.gitignore`, `LICENSE`, and git history.

- **Test gap:** `npm test` (Jest) exits `1` because zero `*.test.js` files exist; only `node test-run.js` runs.
- **Lockfile drift:** `npm ci` exits `1` (`Missing: aegis-cli@1.0.0 ... from lock file`).
- **CI gap:** No `.github/workflows/` pipeline exists to verify builds, tests, or dependencies.
- **Dependency risk:** `npm audit` reports **10 vulnerabilities** (3 high, 1 moderate, 6 low).
- **Positioning & hygiene:** `README.md` omits **governed AI security operations platform** framing, mentions an employer name (`EPAM`), claims SARIF output not yet emitted, and lacks evidence/docs for the **~31s 3-agent ISO 27001 pipeline** claim. An unrelated `ATLAS-AI-WORKSPACE-PLAN.code-workspace` file sits at root.
- **Security docs:** Missing `SECURITY.md`; `.gitignore` lacks secret/IDE patterns (`.env*`, `*.pem`, `*.code-workspace`).

## 2. Top 8 Improvements Ranked by Recruiter / Hiring-Manager Impact

| Rank | Improvement | Hypothesis & Hiring-Manager Signal | Action in This Loop |
| :-: | :--- | :--- | :--- |
| **1** | **README Positioning & Architecture** | Reframing as a **governed AI security operations platform** with an accurate Mermaid diagram and honest scope increases technical credibility immediately. | **RUN** (rewrite `README.md`, remove employer ref) |
| **2** | **Tests + Minimal GitHub Actions CI** | Green `npm test` + CI workflow proves engineering rigor; hiring managers reject repos whose `npm test` fails on clone. | **RUN** (add trivial Jest smoke tests + `.github/workflows/ci.yml`) |
| **3** | **Working Quickstart & Lockfile Sync** | Syncing `package-lock.json` makes `npm ci` and all CLI quickstart commands work out of the box. | **RUN** (sync lockfile, verify CLI, remove leftover `.code-workspace`) |
| **4** | **3-Agent (~31s) Claim Verification Docs** | Explicitly separating verified local deterministic execution (~8ms on mock) from the unverified ~31s 3-agent claim shows intellectual honesty. | **RUN / MEASURE** (document in `README.md` & `KAIZEN_REPORT.md`) |
| **5** | **Dependency Audit Remediation** | Eliminating all non-breaking high/moderate CVEs (`npm audit fix`) shows active supply-chain hygiene. | **RUN** (`npm audit fix`, no `--force` breaking changes) |
| **6** | **Secrets Hygiene & `.gitignore`** | Hardening `.gitignore` and scanning code + git history ensures zero real secrets or client identifiers leak. | **RUN** (scan repo + harden `.gitignore`) |
| **7** | **`SECURITY.md` Disclosure Policy** | Adding vulnerability reporting policy and mock-fixture clarification signals security-architect maturity. | **RUN** (add `SECURITY.md`) |
| **8** | **License & Package Metadata** | Adding `"license": "MIT"` in `package.json` and maintainer attribution in `LICENSE` completes OSS compliance. | **ADJUST** (defer `LICENSE` copyright name confirmation to next iteration; add `"license"` metadata if safe) |

## 3. Guardrails for This Iteration

1. **Zero destructive or breaking edits:** Do not run `npm audit fix --force` or alter scanner rule semantics.
2. **Confidentiality:** Zero real secrets, client names, or internal/employer identifiers.
3. **Verifiability:** Record exact before/after tool outputs in `KAIZEN_REPORT.md` and mark unverified claims clearly.
