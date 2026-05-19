# Simplified Payment Implementation Plan — BallersAdda

## 1. Overview

Payment gateway: **Razorpay**.

**Core Model (Zomato Style):**
- Customer pays → Full amount goes to **BallersAdda**.
- BallersAdda deducts commission.
- Weekly settlement (transfer) of remaining amount to academy/organizer bank account.

**Why this model?**
- Much easier and faster to implement.
- No complex Razorpay Route/Linked Accounts initially.
- Platform maintains better control over funds.
- Easier refunds and dispute handling.

**Supported Flows:**
- Academy Membership Payments (Online only)
- Tournament Registration (Online + Cash)

---

## 2. Payment Model

| Payment Type              | Commission | Settlement          | Notes              |
|---------------------------|------------|---------------------|--------------------|
| Academy Membership        | 7%         | Weekly to Academy   | Online only        |
| Tournament Registration   | 5%         | Weekly to Organizer | Online             |
| Tournament Registration   | 0%         | N/A                 | Cash payments      |

**Settlement Cycle:** Every **Tuesday** (or configurable day).

---

## 3. Core User Flows

### Flow A: Academy Membership Payment

1. Parent selects plan + batch on academy page.
2. Clicks "Join & Pay".
3. Backend creates a Razorpay order.
4. Razorpay Checkout opens (UPI, Card, Netbanking, etc.).
5. On successful payment:
   - Payment verified on backend.
   - Enrollment created.
   - Transaction recorded.
6. Academy sees payment in dashboard.
7. Every Tuesday, platform settles pending amounts to academies.

### Flow B: Tournament Registration (Online)

1. Player registers for tournament.
2. Selects "Pay Online".
3. Razorpay order created.
4. Payment completed.
5. Registration confirmed.
6. Weekly settlement to tournament organizer.

### Flow C: Tournament Registration (Cash)

1. Player selects "Pay with Cash".
2. Registration created with status `PENDING_CASH`.
3. Organizer gets notification.
4. Organizer collects cash and marks as received.
5. Registration status → `CONFIRMED`.

---

## 4. Database Schema

### PaymentTransaction Model

```prisma
model PaymentTransaction {
  id                      Int            @id @default(autoincrement())

  razorpayOrderId         String         @unique
  razorpayPaymentId       String?        @unique

  amountCents             Int
  platformCommissionCents Int
  payoutAmountCents       Int            // Amount to settle to academy/organizer

  type                    PaymentType
  status                  PaymentStatus
  paymentMethod           PaymentMethod  @default(ONLINE)

  userId                  Int
  academyId               Int?
  planId                  Int?
  batchId                 Int?

  tournamentId            Int?
  teamId                  Int?

  enrollmentId            Int?           @unique

  // Cash specific
  cashStatus              CashStatus?

  createdAt               DateTime       @default(now())
  updatedAt               DateTime       @updatedAt
}
```

### Enums

```prisma
enum PaymentType {
  ACADEMY_MEMBERSHIP
  TOURNAMENT_REGISTRATION
}

enum PaymentStatus {
  CREATED
  CAPTURED
  FAILED
  REFUNDED
  PENDING_CASH
  CASH_COLLECTED
}

enum PaymentMethod {
  ONLINE
  CASH
}

enum CashStatus {
  PENDING
  COLLECTED
}
```

---

## 5. Key API Endpoints

| Method | Endpoint                              | Purpose                            | Auth           |
|--------|---------------------------------------|------------------------------------|----------------|
| POST   | `/payment/academy/order`              | Create order for academy membership | User           |
| POST   | `/payment/academy/verify`             | Verify payment & create enrollment | User           |
| POST   | `/payment/tournament/order`           | Create order for tournament        | User           |
| POST   | `/payment/tournament/verify`          | Verify tournament payment          | User           |
| POST   | `/payment/tournament/confirm-cash`    | Organizer confirms cash payment    | Organizer      |
| GET    | `/payment/history`                    | Get user's payment history         | User           |
| GET    | `/payment/academy/:id/transactions`   | Academy's received payments        | Academy Owner  |
| POST   | `/payment/refund`                     | Initiate refund                    | Admin / Academy Owner |

---

## 6. Implementation Phases

| Phase | Focus Area                    | Estimated Time | Priority | Key Deliverables                                          |
|-------|-------------------------------|----------------|----------|-----------------------------------------------------------|
| **1** | Basic Online Payments         | 8–10 days      | High     | Academy membership payment flow (Create Order + Verify)   |
| **2** | Tournament Payments           | 6–7 days       | High     | Online + Cash tournament registration                     |
| **3** | Payment History & Dashboard   | 5–6 days       | Medium   | Transaction history for users & academies                 |
| **4** | Refunds + Error Handling      | 4–5 days       | Medium   | Refund functionality + better error messages              |
| **5** | Weekly Settlement + Polish    | 5–6 days       | Medium   | Settlement logic + admin tools                            |

**Total Estimated Time:** 4.5 – 5.5 weeks

---

## 7. Weekly Settlement Process

**How it works:**

1. Every Tuesday, run script or admin action.
2. Find all `CAPTURED` transactions from last 7 days not yet settled.
3. Group by `academyId` or `tournamentId`.
4. Calculate total payout for each academy/organizer.
5. Platform admin reviews list.
6. Money transferred manually (or via bank transfer / Razorpay Payouts later).
7. Mark transactions as **SETTLED**.

**Initial Approach:** Manual settlement by admin (safer for early stage).

**Later Improvement:** Automate using Razorpay Payouts or direct bank transfers.

---

## 8. Important Technical Notes

- **Webhooks are important** — Use `payment.captured` webhook as source of truth.
- Always **verify signature** on backend (never trust frontend callback alone).
- Store `razorpayOrderId` and `razorpayPaymentId` for tracking.
- Use **idempotency** — Prevent duplicate enrollments if webhook called multiple times.
- For cash payments, do **not** create a Razorpay order.

---

## 9. What We Are NOT Doing (For Now)

- No Razorpay Linked Accounts / Route
- No real-time automatic splitting
- No instant settlement to academies
- No complex KYC for academies initially

These can be added later when platform has more volume and stable operations.

---

## 10. Summary

| Topic                    | Decision                           | Reason                            |
|--------------------------|------------------------------------|-----------------------------------|
| Payment Gateway          | Razorpay                           | Reliable + Good UPI support       |
| Money Flow               | Platform first → Weekly settlement | Simple & controllable             |
| Commission               | 5–7%                               | Standard in the industry          |
| Cash Payments            | Supported (limited)                | Realistic for India               |
| Complexity Level         | Low to Medium                      | Good for early stage              |
| Time to MVP              | 4.5 – 5.5 weeks                   | Realistic                         |
