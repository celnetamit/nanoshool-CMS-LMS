# NSTC Platform — Moodle Integration Boundary

## Integration Strategy

- Moodle stays as the **learning delivery engine** (v1 and beyond)
- Our platform communicates via **Moodle Web Services REST API**
- Sync is **event-driven** (triggered by payment webhook) + **cron-based** (completion polling)
- All Moodle operations go through a dedicated `moodle.service.ts`
- Failed operations are queued (BullMQ + Redis) and retried automatically

---

## Required Moodle API Calls

### 1. Create User (if not exists)
```
Function: core_user_create_users
Method: POST
Payload: { username, password, firstname, lastname, email }
Returns: [{ id, username }]
Store: moodle_user_id in our users table (add field)
```

### 2. Enroll User in Course
```
Function: enrol_manual_enrol_users
Method: POST
Payload: { enrolments: [{ roleid: 5, userid, courseid }] }
roleid 5 = student role
Returns: null (no response body on success)
Trigger: After payment.captured webhook
```

### 3. Get Course Completion Status
```
Function: core_completion_get_course_completion_status
Method: GET
Payload: { courseid, userid }
Returns: { status, timecompleted }
Trigger: Cron every 6 hours
```

### 4. Get Certificate (if Moodle generates them)
```
Function: mod_certificate_get_issue_certificates (plugin-dependent)
Method: GET
Returns: certificate URL
Trigger: After completion status = complete
```

---

## Data Mapping

| Our Field | Moodle Field |
|---|---|
| `products.moodle_course_id` | `courseid` |
| `users.moodle_user_id` (add) | `userid` |
| `enrollments.moodle_enrollment_status` | `true` after successful enrol call |

---

## Environment Variables Required

```
MOODLE_BASE_URL=https://lms.yourdomain.com
MOODLE_API_TOKEN=your_moodle_webservice_token
```

---

## Retry Queue Design

- Tool: **BullMQ** with Redis
- Queue name: `moodle-sync`
- Jobs: `create-user`, `enroll-user`, `check-completion`
- Retry strategy: 3 attempts, exponential backoff (1s, 5s, 30s)
- On final failure: alert admin via email + mark `moodle_enrollment_status = false`

---

## Moodle API Enabling Steps (Pre-requisite)

1. Enable Web Services in Moodle: `Site Admin → Advanced Features → Enable web services`
2. Enable REST protocol: `Site Admin → Plugins → Web services → Manage protocols`
3. Create external service with required functions
4. Create service token for the API user
5. Assign token to `MOODLE_API_TOKEN` env var
