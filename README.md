# SERA — Zero-Cost MVP Starter

A no-backend, runnable Expo prototype for the SERA Care flow.

## Included
- Customer home
- SERA Care request
- Estimated duration selection
- Customer pricing
- Partner matched view
- Arrival + Start Care verification
- Active Care timer demo
- Exact pay-per-minute billing example
- Partner payout
- SERA commission calculation

## Pricing logic in this demo
- Customer travel: ₹7/km
- Customer Care: ₹150/hour, billed by the minute
- Partner travel payout: ₹7/km
- Partner Care payout: ₹100/hour, billed by the minute
- Completion bonus: ₹40
- No Care-time billing before Start Care
- Customer can End Care at any time

## Run
Install Node.js and Expo tooling, then:

    npm install
    npx expo start

Use Expo Go on a phone or an emulator. This prototype intentionally has no paid backend, payment gateway, maps API, SMS API, or cloud infrastructure yet.
