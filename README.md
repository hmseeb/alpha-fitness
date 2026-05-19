# Alpha Fitness

Offline-first gym management for Alpha Fitness Jampur. Tracks members, fees, staff payroll, and payments. Works on a laptop with or without internet — syncs to Supabase the moment it's back online.

## Features

- Members roster with photos, fees, time-tables, tiers
- Payment history per member, multi-month catch-up with auto "absent" logging
- Overdue + due-soon visual indicators
- Staff/payroll: advances, salary, bonuses with monthly balance tracking
- Dashboard: active members, overdue, fees received, staff paid, net cashflow
- Offline-first: SQLite local DB + outbox queue, syncs to Supabase every 30s
- Excel/CSV export
- Auto-updates via GitHub Releases

## Stack

Electron · React · TypeScript · Tailwind · better-sqlite3 · Supabase (Postgres + Storage + Auth)

## Development

```bash
npm install
npm run dev
```

## Release

Tag and push — GitHub Actions builds the Windows installer and publishes it as a Release.

```bash
git tag v0.1.0
git push --tags
```

The app auto-checks for updates on launch and every 4 hours.

## License

Proprietary. © Alpha Fitness Jampur.
