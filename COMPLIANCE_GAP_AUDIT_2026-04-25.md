# Compliance Gap Audit

Date: 2026-04-25
Repo: `nanoshool-CMS-LMS`
Scope: application and repo posture review for `SOC 2`, `HIPAA`, `GDPR`, and broader global privacy/security expectations

## Executive Summary

The current `NSTC` application is **not ready to claim compliance** with `SOC 2`, `HIPAA`, or global privacy regimes such as `GDPR`.

The platform does show some positive security and operational building blocks:

- role-based access control is explicitly modeled and enforced in middleware and APIs
- payment webhooks use signature verification and idempotency checks
- authentication uses hashed passwords and JWT-backed sessions
- privacy/legal pages now exist on the public surface

However, the codebase and repository currently have several high-severity blockers that prevent any credible compliance claim:

1. sensitive personal data is present in the repository
2. there is no visible audit-log / audit-trail system for regulated actions
3. there are no implemented data subject rights workflows for access, export, rectification, or erasure
4. there is no visible retention / deletion governance layer
5. there is no visible incident response, vendor management, backup/restore evidence, or control-evidence framework
6. there are security hygiene issues that are unacceptable in regulated environments, including fallback secrets in config

## Important Clarification

This audit assumes the user meant:

- `SOC 2` instead of `SO2`
- `HIPAA` instead of `HDCP`

If the actual target is something else, this document should be adjusted.

## Current-State Verdict

### SOC 2

Verdict: **Not audit-ready**

Reason:

- Some technical controls exist, but the repository does not show enough evidence of administrative and operational controls required to support a real SOC 2 examination.

### HIPAA

Verdict: **Not suitable today for PHI/ePHI workloads**

Reason:

- Even if the app is not currently a healthcare platform, the present implementation and repository hygiene are not sufficient for storing or processing regulated health information.

### GDPR / Global Privacy Rules

Verdict: **Partially alignable, but materially incomplete**

Reason:

- Public policy pages exist, but the operational mechanisms behind those rights and obligations are not implemented.

## Findings

### Critical

1. Sensitive personal data exists inside the repository

Evidence:

- mentor data CSV is committed in the repo: [260424044248_new-mentorship-form-basic-info_formidable_entries.csv](/home/itb09/Desktop/projects/nstc/260424044248_new-mentorship-form-basic-info_formidable_entries.csv:46)
- the file includes names, emails, profile metadata, and what appear to be password-hash-like values in some rows: [260424044248_new-mentorship-form-basic-info_formidable_entries.csv](/home/itb09/Desktop/projects/nstc/260424044248_new-mentorship-form-basic-info_formidable_entries.csv:49), [260424044248_new-mentorship-form-basic-info_formidable_entries.csv](/home/itb09/Desktop/projects/nstc/260424044248_new-mentorship-form-basic-info_formidable_entries.csv:53), [260424044248_new-mentorship-form-basic-info_formidable_entries.csv](/home/itb09/Desktop/projects/nstc/260424044248_new-mentorship-form-basic-info_formidable_entries.csv:55)

Impact:

- This is a major compliance and security red flag for `SOC 2`, `GDPR`, and especially any future `HIPAA` posture.
- Repository access now becomes part of the data exposure surface.

2. No visible audit logging for regulated or privileged actions

Evidence:

- role enforcement exists: [middleware.ts](/home/itb09/Desktop/projects/nstc/middleware.ts:8)
- but there is no visible audit-log subsystem for admin changes, refunds, access reviews, policy changes, user-role changes, or data exports/deletions

Impact:

- Fails core expectations for `SOC 2`
- materially weak for `HIPAA`
- weak for privacy accountability and investigations

3. Secrets posture includes insecure fallback behavior

Evidence:

- Payload secret falls back to a hardcoded value if env is missing: [payload.config.ts](/home/itb09/Desktop/projects/nstc/payload.config.ts:53)

Impact:

- This is not acceptable for regulated deployment.
- Secret misconfiguration should fail closed, not silently downgrade.

### High

4. No visible DSAR workflows for privacy rights

Missing capabilities:

- access request handling
- export of user data
- rectification workflow
- erasure / deletion workflow
- consent withdrawal handling
- restriction / objection workflow

Evidence:

- public legal/privacy pages exist, but I found no implemented app-side DSAR or privacy-ops workflows during review

Impact:

- major gap for `GDPR`
- weak for other global privacy laws with similar consumer rights

5. No visible retention and deletion governance

Missing capabilities:

- retention schedules by data type
- deletion execution workflow
- archive vs delete controls
- legal hold / investigation hold handling

Impact:

- weak for `SOC 2`
- weak for `GDPR`
- problematic for any regulated records environment

6. No visible compliance evidence layer for operations

Missing capabilities:

- access review evidence
- incident register
- change approval evidence
- vendor/subprocessor inventory
- backup and restore evidence
- disaster recovery test evidence
- risk register

Impact:

- without these, a real `SOC 2` examination will not succeed even if some code controls exist

7. Session posture is not compliance-grade

Evidence:

- JWT session with 30-day max age: [lib/auth/index.ts](/home/itb09/Desktop/projects/nstc/lib/auth/index.ts:90)

Missing capabilities:

- shorter risk-based session limits
- forced reauthentication for privileged actions
- session inventory and revocation UX
- stronger idle timeout handling
- admin session hardening policy

Impact:

- not automatically non-compliant, but weak for stronger security expectations

### Medium

8. Storage and encryption governance is not explicit enough

Evidence:

- S3/R2 storage is configured: [payload.config.ts](/home/itb09/Desktop/projects/nstc/payload.config.ts:66)

Missing visible controls:

- explicit SSE/KMS policy references
- key rotation policy
- file classification by sensitivity
- retention by object class
- documented restricted-access patterns for sensitive uploads

Impact:

- may be solvable at infra level, but it is not visible or provable from current repo posture

9. Payment and access controls are good but narrow

Evidence:

- webhook signature verification and idempotency exist: [app/api/payment/webhook/route.ts](/home/itb09/Desktop/projects/nstc/app/api/payment/webhook/route.ts:12), [app/api/payment/webhook/route.ts](/home/itb09/Desktop/projects/nstc/app/api/payment/webhook/route.ts:83)
- role and permission model is documented and enforced: [docs/architecture/roles-and-permissions.md](/home/itb09/Desktop/projects/nstc/docs/architecture/roles-and-permissions.md:1), [middleware.ts](/home/itb09/Desktop/projects/nstc/middleware.ts:81)

Impact:

- good security foundation for payment integrity
- not enough on its own for broader compliance

10. Debug logging and operational logging need review

Evidence:

- auth config details are logged in non-production: [lib/auth/index.ts](/home/itb09/Desktop/projects/nstc/lib/auth/index.ts:39)
- webhook and queue failures log operational details: [app/api/payment/webhook/route.ts](/home/itb09/Desktop/projects/nstc/app/api/payment/webhook/route.ts:31), [app/api/payment/webhook/route.ts](/home/itb09/Desktop/projects/nstc/app/api/payment/webhook/route.ts:155)

Impact:

- logging is necessary, but regulated environments require a defined log-sanitization and retention policy

## Framework-by-Framework Assessment

### SOC 2

#### What already helps

- access control by role
- server-side authorization checks
- payment webhook integrity checks
- queue-based operational processing

#### What is still missing

- security control inventory
- audit logs
- change management evidence
- formal incident response
- risk management process
- vendor management
- backup/restore evidence
- data retention policy
- access review process
- secure SDLC evidence
- secret management hardening

Conclusion:

- This repo can become part of a SOC 2-ready platform, but it is not close enough today to market or certify as compliant.

### HIPAA

#### What already helps

- some role isolation
- signed webhook handling
- auth and session framework

#### What is still missing

- formal administrative safeguards
- physical safeguards evidence
- technical safeguards mapped to ePHI handling
- minimum necessary access model for health data
- audit logging for PHI access
- encrypted data handling controls and evidence
- breach response workflow
- BAA/vendor management
- workforce training evidence
- device/media governance

Conclusion:

- Do not use this application for `PHI/ePHI` workloads in its current state.

### GDPR and Global Privacy Rules

#### What already helps

- public privacy and consent pages exist
- identifiable data domains are conceptually visible in the platform

#### What is still missing

- lawful-basis mapping by data type
- records of processing activities
- data subject rights tooling
- retention/deletion automation
- consent withdrawal workflows where applicable
- processor/subprocessor transparency
- cross-border transfer governance
- privacy incident response

Conclusion:

- current privacy posture is documentation-led, not operations-led

## Priority Remediation Plan

### Phase 0: Immediate Risk Reduction

1. Remove the committed mentor CSV and any other sensitive exports from the repository and git history.
2. Rotate any secrets or credentials that may have been exposed or derived from committed data.
3. Remove insecure secret fallbacks and fail hard when required secrets are missing.
4. Review logs and storage locations for any additional accidental sensitive-data persistence.

### Phase 1: Core Security and Evidence Controls

1. Add a formal audit-log subsystem for:
   - admin login
   - role changes
   - product publish/unpublish
   - refund actions
   - legal/policy edits
   - sensitive record views or exports
2. Add secret-management hardening:
   - no fallback production secrets
   - documented secret rotation
   - environment validation on startup
3. Add privileged-action reauthentication or stronger session controls.
4. Add centralized structured logging with sanitization guidance.

### Phase 2: Privacy Operations Layer

1. Implement DSAR workflows:
   - export my data
   - request deletion
   - rectify profile data
   - support case tracking
2. Add retention policy enforcement by entity type.
3. Add consent-history and policy-version tracking where required.
4. Add privacy operations documentation and support playbooks.

### Phase 3: Compliance Program Layer

1. Create a control matrix mapping:
   - `SOC 2 CC-series`
   - `GDPR operational obligations`
   - `HIPAA safeguards` if healthcare scope is intended
2. Build supporting non-code evidence:
   - incident response plan
   - access review policy
   - change management policy
   - vendor/subprocessor register
   - backup and restore testing records
   - risk register

### Phase 4: Optional HIPAA Track

Only pursue this if the business will actually process `PHI/ePHI`.

1. classify PHI data flows
2. isolate PHI-bearing services and storage
3. implement PHI access auditability
4. formalize vendor/BAA coverage
5. perform HIPAA security risk analysis

## Recommended Positioning Today

What the product can safely say today:

- security-conscious application with role-based access and signed payment webhooks
- privacy and legal surfaces are being implemented
- compliance hardening is in progress

What the product should **not** say today:

- `SOC 2 compliant`
- `HIPAA compliant`
- `GDPR compliant`
- `globally compliant`

## Recommended Next Deliverables

1. `CONTROL_MATRIX_SOC2_GDPR_HIPAA_2026-04-25.md`
   - requirement-by-requirement mapping
2. `COMPLIANCE_IMPLEMENTATION_ROADMAP_2026-04-25.md`
   - owners, milestones, and evidence outputs
3. app-side implementation wave
   - audit log
   - DSAR endpoints
   - retention hooks
   - env validation and secret hardening

## Source Notes

External references used for framing:

- AICPA SOC 2 overview: https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2
- HHS HIPAA Security Rule: https://www.hhs.gov/hipaa/for-professionals/security/index.html
- European Commission GDPR rights overview: https://commission.europa.eu/law/law-topic/data-protection/reform/rights-citizens/my-rights/what-are-my-rights_lv
