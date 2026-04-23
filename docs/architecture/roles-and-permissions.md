# NSTC Platform — Role & Permission Matrix

## Roles

| Role | Enum Value | Description |
|---|---|---|
| Admin | `admin` | Full platform control |
| Program Manager | `program_manager` | Manages cohorts, learners, progress |
| Mentor | `mentor` | Views and manages assigned programs |
| Participant | `participant` | Default user — enrolled learner |

---

## Route Access Control

| Route Prefix | admin | program_manager | mentor | participant |
|---|---|---|---|---|
| `/dashboard/admin/*` | ✅ | ❌ | ❌ | ❌ |
| `/dashboard/program-manager/*` | ✅ | ✅ | ❌ | ❌ |
| `/dashboard/mentor/*` | ✅ | ❌ | ✅ | ❌ |
| `/dashboard/participant/*` | ✅ | ❌ | ❌ | ✅ |
| `/dashboard` (root redirect) | → `/dashboard/admin` | → `/dashboard/program-manager` | → `/dashboard/mentor` | → `/dashboard/participant` |

---

## API Endpoint Permissions

| Endpoint | Method | Allowed Roles |
|---|---|---|
| `/api/auth/signup` | POST | Public |
| `/api/auth/login` | POST | Public |
| `/api/auth/me` | GET | Any authenticated |
| `/api/products` | GET | Public |
| `/api/products/[slug]` | GET | Public |
| `/api/admin/products` | POST/PUT/DELETE | admin |
| `/api/admin/users` | GET/PUT | admin |
| `/api/admin/payments` | GET | admin |
| `/api/admin/refund` | POST | admin |
| `/api/enroll` | POST | participant |
| `/api/enrollments/user` | GET | participant (own only) |
| `/api/payment/create-order` | POST | participant |
| `/api/payment/webhook` | POST | Public (Razorpay, signature verified) |
| `/api/search` | GET | Public |
| `/api/coupon/validate` | POST | participant |

---

## Data Visibility Rules

### Participant
- Can only see **own** enrollments, invoices, certificates
- Cannot see other users' data
- Cannot see draft products

### Mentor
- Can only see **assigned** programs
- Can see learner list for their programs only
- Cannot manage enrollments or payments

### Program Manager
- Can see cohorts they manage
- Can see learner progress within their cohorts
- Cannot access payment records or refund controls

### Admin
- Full read/write access to all data
- Only role that can initiate refunds
- Only role that can publish/unpublish products
- Only role that can manage user roles

---

## Implementation Notes

- Role is stored in the JWT payload as `role`
- Next.js middleware reads JWT and enforces route-level access
- Server components use `getServerSession()` + role check
- API routes check `session.user.role` before processing
- Participant data is always filtered with `WHERE user_id = session.user.id`
