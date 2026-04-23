# NSTC Platform — Payment & Enrollment State Machine

## Payment States

```
created → paid
created → failed
paid    → refunded
```

| State | Description |
|---|---|
| `pending` | Razorpay order created, user has not completed payment |
| `paid` | `payment.captured` webhook received and signature verified |
| `failed` | `payment.failed` webhook received |
| `refunded` | `refund.created` webhook received |

---

## Enrollment / Access States

```
locked → active → completed
active → revoked
```

| State | Description |
|---|---|
| `locked` | Enrollment record exists but payment not confirmed |
| `active` | Payment confirmed, Moodle access granted |
| `revoked` | Refund processed, access removed |
| `completed` | Learner has completed the course (from Moodle completion sync) |

---

## Full Purchase Flow

```
1. User clicks "Enroll"
2. POST /api/payment/create-order
   → Create payment record (status: pending)
   → Create Razorpay order
   → Return { orderId, amount, currency, keyId }
3. Razorpay JS SDK opens payment modal
4. User completes payment
5. Razorpay fires webhook → POST /api/payment/webhook
6. Verify HMAC signature (RAZORPAY_WEBHOOK_SECRET)
   → If invalid: return 400, log attempt
   → If valid: continue
7. Check idempotency — if payment already processed, return 200
8. Update payment record (status: paid)
9. Create/update enrollment record (access_status: active)
10. Trigger Moodle enrollment (async, via queue)
11. Generate invoice PDF → upload to S3 → store pdf_url
12. Send confirmation email with invoice link
13. Return 200 to Razorpay
```

---

## Refund Flow

```
1. Admin initiates refund via /dashboard/admin/payments
2. POST /api/admin/refund { enrollmentId }
3. Verify enrollment exists and payment is in `paid` state
4. Call Razorpay Refund API
5. Razorpay fires refund.created webhook
6. Update payment status → refunded
7. Update enrollment access_status → revoked
8. Update Moodle: unenroll user from course
9. Send refund notification email to user
```

---

## Webhook Events Handled

| Event | Action |
|---|---|
| `payment.captured` | Confirm payment, create enrollment, trigger Moodle, generate invoice |
| `payment.failed` | Update payment status to failed, notify user |
| `refund.created` | Revoke enrollment, unenroll from Moodle, notify user |

---

## Idempotency Rule

Every webhook handler must:
1. Check if `razorpay_payment_id` already exists in DB
2. If yes → return 200 immediately (already processed)
3. If no → process and store

This prevents duplicate enrollments from duplicate webhook deliveries.

---

## Critical Rule

> ⚠️ **NEVER grant access based on browser redirect or frontend callback.**
> Access is granted **only** after webhook signature verification and DB update.
