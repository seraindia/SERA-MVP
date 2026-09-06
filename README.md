# SERA — Zero-Cost MVP v0.2

A runnable Expo prototype for the SERA Care customer + partner flow. It is intentionally local-only: no paid backend, maps, SMS, payment gateway, or cloud infrastructure.

## What's new
- Customer / Partner demo-role switch.
- Customer Care booking journey.
- Partner Care request + payout preview.
- Live Care timer after verified Start Care.
- End Care at any moment.
- Exact minute-based customer billing and partner payout.
- 30-minute minimum billable duration.
- Travel ₹7/km.
- Customer Care rate ₹150/hour.
- Partner Care payout ₹100/hour.
- ₹40 completion bonus.
- SERA commission = customer payment minus partner payout in this prototype.

## Run
1. Install Node.js.
2. In this folder run `npm install`.
3. Run `npx expo start`.
4. Open with Expo Go or an emulator.

## Important
This is a prototype/demo engine. For production, the timer and fare calculation must be server-authoritative, with authenticated customer/partner accounts, GPS verification, task state transitions, audit logs, and payment settlement.
