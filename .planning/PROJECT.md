# Alpha Fitness Jampur — Gym Management App

## Vision

Replace the Excel sheet at Alpha Fitness Jampur with a simple, modern desktop app that the owner can run on a single machine to manage gym members.

## Core Value

Owner can add, view, edit, and track payment status of gym members with photos, and instantly see who owes money.

## Users

Single user: the gym owner. No auth, no roles, no multi-user.

## Form Factor

Local desktop application (Mac primary, possibly Windows later). All data stays on the owner's machine in a SQLite file plus a photos directory.

## Fields (per student)

| Field | Type | Notes |
|---|---|---|
| sr_no | int | Auto-assigned, editable |
| picture | image | Stored as file in userData/photos, path in DB |
| student_name | text | Required |
| contact_number | text | Phone format like 0333-8325556 |
| time_table | enum | Morning / Evening |
| fees | int | Monthly fee in PKR |
| month | text | Current billing month |
| registration_fee_status | enum | Paid / Nill |
| entry_date | date | When they joined |
| next_fees_date | date | Auto = entry_date + 1 month, advances on payment |
| membership | enum | Normal / Premium (extensible) |
| paid_through | text | Bank name e.g. Meezan Bank, or Cash |
| remaining | int | Outstanding balance |

## v1 Scope

- CRUD students with photo
- Dashboard: active members, monthly revenue, count of overdue students
- Auto-flag overdue (next_fees_date < today)
- Payment history per student (separate payments table)
- Export all students to .xlsx

## Out of Scope (v1)

- Cloud sync, multi-device
- Student-facing login
- SMS/email reminders
- Attendance tracking
- Workout plans

## Key Decisions

| Decision | Rationale |
|---|---|
| Electron over Tauri | Easier packaging, more familiar, owner is non-technical |
| SQLite via better-sqlite3 | Single-file local DB, zero config, fast |
| shadcn/ui + Tailwind | Modern look out of the box, requested "modern design" |
| Photos as files, not blobs | Keeps DB small, easier to back up the photos folder |

---
*Last updated: 2026-05-19 after initialization*
