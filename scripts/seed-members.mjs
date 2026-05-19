import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

const URL = 'https://xkxlrtiovlmbdecjblpn.supabase.co'
const SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhreGxydGlvdmxtYmRlY2pibHBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEyNDE5NiwiZXhwIjoyMDk0NzAwMTk2fQ.ljeHQXAEWxR2EtZpvI4bvMT7-ZEmDoImwrLhjzj5UeQ'

const supabase = createClient(URL, SERVICE, { auth: { persistSession: false } })

// Find the first user (single-user setup)
const { data: users, error: ue } = await supabase.auth.admin.listUsers()
if (ue) { console.error(ue); process.exit(1) }
const owner = users.users[0]
if (!owner) { console.error('No user found. Sign up first.'); process.exit(1) }
console.log(`✓ Owner: ${owner.email} (${owner.id})`)

const firsts = ['Ahmad', 'Bilal', 'Hamza', 'Usman', 'Ali', 'Saad', 'Faisal', 'Hassan', 'Hussain', 'Tariq', 'Salman', 'Imran', 'Asad', 'Rizwan', 'Adeel', 'Omar', 'Khalid', 'Shahid', 'Naveed', 'Waseem', 'Aamir', 'Atif', 'Yasir', 'Talha', 'Zain', 'Arsalan', 'Daniyal', 'Fahad', 'Junaid', 'Kamran', 'Mubashir', 'Nadeem', 'Owais', 'Rashid', 'Shoaib', 'Umair', 'Waqas', 'Zeeshan', 'Abdullah', 'Ibrahim']
const lasts = ['Khan', 'Ali', 'Shah', 'Ahmed', 'Iqbal', 'Akhtar', 'Sheikh', 'Malik', 'Mahmood', 'Hussain', 'Raza', 'Anjum', 'Bashir', 'Chaudhry', 'Dar', 'Farooq', 'Ghani', 'Hashmi', 'Javed', 'Latif', 'Mirza', 'Nawaz', 'Qureshi', 'Rahman', 'Saleem', 'Tahir', 'Yousuf', 'Zafar']
const banks = ['Meezan Bank', 'HBL', 'UBL', 'Allied Bank', 'Bank Alfalah', 'Faysal Bank', 'JS Bank', 'Cash', 'EasyPaisa', 'JazzCash']
const tiers = ['Normal', 'Normal', 'Normal', 'Normal', 'Premium', 'Premium', 'VIP']
const times = ['Morning', 'Evening', 'Evening', 'Evening']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const pick = (a) => a[Math.floor(Math.random() * a.length)]
const rint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

function makePhone() {
  return `03${rint(0, 4)}${rint(0, 9)}-${String(rint(1000000, 9999999))}`
}

function isoDate(d) { return d.toISOString().slice(0, 10) }

function makeMember(i) {
  const name = `${pick(firsts)} ${pick(lasts)}`
  const tier = pick(tiers)
  const fees = tier === 'VIP' ? 8000 : tier === 'Premium' ? 6000 : pick([3000, 3500, 4000, 4500, 5000])

  // Entry date: random in last 18 months
  const entryDate = new Date()
  entryDate.setDate(entryDate.getDate() - rint(1, 540))
  // Next fees due: roughly one month after most-recent payment cycle
  // For ~25% of members, push the date into the past so they show as overdue
  const nextDue = new Date(entryDate)
  const cyclesSinceEntry = rint(1, 18)
  nextDue.setMonth(entryDate.getMonth() + cyclesSinceEntry)
  if (Math.random() < 0.25) {
    nextDue.setDate(nextDue.getDate() - rint(1, 40))
  } else {
    nextDue.setDate(nextDue.getDate() + rint(0, 25))
  }

  const remaining = Math.random() < 0.15 ? rint(500, 5000) : 0
  const regPaid = Math.random() < 0.7 ? 'Paid' : 'Nill'

  return {
    id: randomUUID(),
    owner_id: owner.id,
    sr_no: i + 1,
    name,
    contact: makePhone(),
    time_table: pick(times),
    fees,
    month: pick(months),
    reg_fee_status: regPaid,
    entry_date: isoDate(entryDate),
    next_fees_date: isoDate(nextDue),
    membership: tier,
    paid_through: pick(banks),
    remaining,
  }
}

const N = 80
const rows = Array.from({ length: N }, (_, i) => makeMember(i))
const { error } = await supabase.from('students').insert(rows)
if (error) { console.error(error); process.exit(1) }
console.log(`✓ Inserted ${N} members`)

// Also seed some payment history per member (1-4 payments each)
const payments = []
for (const m of rows) {
  const count = rint(1, 4)
  for (let k = 0; k < count; k++) {
    const paidOn = new Date(m.entry_date)
    paidOn.setMonth(paidOn.getMonth() + k)
    payments.push({
      id: randomUUID(),
      owner_id: owner.id,
      student_id: m.id,
      amount: m.fees,
      paid_on: isoDate(paidOn),
      method: m.paid_through,
      note: '',
    })
  }
}
const { error: pe } = await supabase.from('payments').insert(payments)
if (pe) { console.error(pe); process.exit(1) }
console.log(`✓ Inserted ${payments.length} payments`)
console.log('\nDone. The app will pull these on next sync (within 30s).')
