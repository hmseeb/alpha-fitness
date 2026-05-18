# Alpha Fitness — v1 Requirements

## v1

### Students
- [ ] **STU-01**: Owner can add a new student with all 13 fields including a photo
- [ ] **STU-02**: Owner can view all students in a searchable table with thumbnails
- [ ] **STU-03**: Owner can edit any student field
- [ ] **STU-04**: Owner can delete a student (with confirm)
- [ ] **STU-05**: Photo upload accepts JPG/PNG and is stored locally
- [ ] **STU-06**: next_fees_date auto-computes as entry_date + 1 month on create

### Payments
- [ ] **PAY-01**: Owner can record a payment for a student (amount, date, method)
- [ ] **PAY-02**: Recording a payment advances next_fees_date by 1 month
- [ ] **PAY-03**: Owner can view payment history per student

### Dashboard
- [ ] **DASH-01**: Home screen shows count of active members
- [ ] **DASH-02**: Home screen shows monthly revenue (sum of fees this month)
- [ ] **DASH-03**: Home screen shows count of overdue students
- [ ] **DASH-04**: Overdue students are visually highlighted in the table

### Data
- [ ] **DATA-01**: All data persists to a local SQLite file across app restarts
- [ ] **DATA-02**: Owner can export all students to a .xlsx file

## Out of Scope

- Cloud sync
- Student logins
- SMS / WhatsApp reminders
- Attendance, workouts, trainers
