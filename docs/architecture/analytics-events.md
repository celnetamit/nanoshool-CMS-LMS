# NSTC Platform — Analytics Event Plan

## Provider
- **Primary:** PostHog (self-hosted or cloud) — recommended for privacy + feature flags
- **Fallback:** Mixpanel or custom event log table

---

## Events

### Page Events
| Event | Properties |
|---|---|
| `page_view` | `path`, `domain`, `page_type` |
| `search_performed` | `query`, `filters`, `result_count` |

### Product Events
| Event | Properties |
|---|---|
| `product_viewed` | `product_id`, `product_slug`, `product_type`, `domain`, `price` |
| `product_listing_filtered` | `domain`, `filters_applied`, `result_count` |
| `related_product_clicked` | `from_product_id`, `to_product_id` |

### Commerce Events
| Event | Properties |
|---|---|
| `checkout_started` | `product_id`, `price`, `user_id` |
| `coupon_applied` | `coupon_code`, `discount_amount` |
| `payment_initiated` | `product_id`, `amount`, `razorpay_order_id` |
| `payment_success` | `product_id`, `amount`, `razorpay_payment_id` |
| `payment_failed` | `product_id`, `razorpay_order_id`, `reason` |
| `refund_requested` | `enrollment_id`, `product_id` |

### Enrollment Events
| Event | Properties |
|---|---|
| `enrollment_created` | `enrollment_id`, `product_id`, `user_id` |
| `moodle_sync_success` | `enrollment_id`, `moodle_course_id` |
| `moodle_sync_failed` | `enrollment_id`, `error` |
| `certificate_issued` | `user_id`, `product_id` |

### User Events
| Event | Properties |
|---|---|
| `user_signed_up` | `user_id`, `role`, `source` |
| `user_logged_in` | `user_id`, `role` |
| `dashboard_visited` | `role`, `section` |

---

## Implementation

```ts
// /lib/analytics.ts
export const track = (event: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties)
  }
}
```

---

## KPIs Tracked

| KPI | Events Used |
|---|---|
| Conversion rate | `product_viewed` → `payment_success` |
| Search success rate | `search_performed` (result_count > 0) |
| Enrollment rate | `checkout_started` → `enrollment_created` |
| Course completion | `certificate_issued` / total `enrollment_created` |
| CAC vs LTV | External (ad spend data vs payment_success sum) |
