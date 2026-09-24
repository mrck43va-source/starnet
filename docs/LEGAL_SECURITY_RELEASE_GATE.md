# OpenCK Legal, Safety & Security Release Gate

This repository inherits the OpenCK Empire Legal, Safety & Security Standard.

## Fail-closed rule
A build, feature, demo, deployment, customer workflow, release or campaign is **HOLD / NO-GO** when a material P0 legal, safety, privacy or security gate is unresolved.

## Required review
Before production/customer-facing release, confirm and retain evidence for applicable items:
- [ ] Correct entity/brand/seller identity
- [ ] Age/minor/COPPA impact reviewed
- [ ] Third-party fonts/scripts/SDKs documented
- [ ] Session replay/tracking/privacy reviewed; sensitive fields excluded
- [ ] Privacy notice/data flow/retention/subprocessors match actual behavior
- [ ] Marketing email/SMS consent, unsubscribe and suppression controls verified
- [ ] Subscription/payment/cancellation terms match checkout
- [ ] UGC/DMCA/community-safety obligations reviewed
- [ ] No secrets, credentials, MFA codes or customer-sensitive data added
- [ ] Authentication/authorization/tenant isolation tested where relevant
- [ ] Dependency/secret/security tests passed
- [ ] Payment/webhook controls reviewed
- [ ] Claims/testimonials/performance language substantiated
- [ ] AI/IP/license/likeness rights reviewed
- [ ] Accessibility reviewed if customer-facing
- [ ] Incident/rollback/kill-switch impact considered
- [ ] Required legal/compliance escalation completed
- [ ] Final state recorded: GO / HOLD / NO-GO

## Mandatory escalation
Stop for qualified review before personalized trading advice/signals/copy trading/customer fund access; child-directed products or knowing under-13 collection; sensitive biometrics/precise location/health data; public UGC launch without copyright/moderation processes; complex multi-state subscription mechanics; or material security/privacy incidents, subpoenas, regulator contact or threatened claims.

## Engineering baseline
Apply NIST CSF 2.0 / SSDF principles: least privilege, secrets protection, environment isolation, secure auth/session handling, dependency and secret scanning, auditable sensitive actions, verified webhooks, backups/restore testing, monitoring, incident response and a kill switch.

## Repo-specific rule
Existing SECURITY.md remains authoritative for vulnerability reporting. Human approval gates, least privilege, audit logs and kill-switch behavior are mandatory for consequential agent actions.

Central source of truth: OpenCK Entity & Compliance Command Register → **Empire Legal-Security Gate**.
