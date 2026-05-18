# Alpha Fitness — Roadmap

**3 phases** | **15 requirements** | All v1 mapped

| # | Phase | Goal | Requirements |
|---|---|---|---|
| 1 | Foundation | App boots, DB persists | DATA-01 |
| 2 | Student CRUD + Dashboard | Owner manages members | STU-01..06, DASH-01..04 |
| 3 | Payments + Export | Track money in/out, backup | PAY-01..03, DATA-02 |

## Phase Details

### Phase 1 — Foundation
Goal: Electron app launches, shows a hello screen, SQLite is wired and tables exist.
Success:
1. `npm start` opens a window
2. Schema is migrated on first run
3. UI renders with Tailwind + shadcn theme

### Phase 2 — Student CRUD + Dashboard
Goal: Owner can fully manage students and see the home dashboard.
Success:
1. Add a student with photo, see them in the table
2. Edit, delete work
3. Dashboard cards show correct counts
4. Overdue rows highlighted red

### Phase 3 — Payments + Export
Goal: Money flow recorded, data exportable for backup.
Success:
1. Click a student, see history, record a payment
2. next_fees_date advances correctly
3. Export downloads a .xlsx with all students
