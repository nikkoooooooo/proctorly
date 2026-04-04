import Link from "next/link"

const kpis = [
  { label: "Active Classes", value: "12", trend: "+2 this term" },
  { label: "Total Students", value: "348", trend: "+18 this month" },
  { label: "Avg. Completion", value: "86%", trend: "+4% vs last month" },
  { label: "At-Risk Students", value: "9", trend: "-3 this week" },
]

const classes = [
  { name: "Algebra II", students: 28, completion: "82%", lastActivity: "2 hours ago" },
  { name: "World History", students: 31, completion: "88%", lastActivity: "Today" },
  { name: "Biology", students: 25, completion: "79%", lastActivity: "Yesterday" },
  { name: "SAT Prep", students: 19, completion: "91%", lastActivity: "3 days ago" },
]

const progressSignals = [
  { student: "Ariana N.", status: "Needs follow-up", detail: "Missed 2 assessments" },
  { student: "Chris T.", status: "On track", detail: "Completed 4/4 modules" },
  { student: "Mei L.", status: "Improving", detail: "+12% score this week" },
  { student: "Jordan P.", status: "Needs support", detail: "Low engagement" },
]

const automations = [
  {
    title: "Weekly Progress Digest",
    detail: "Auto-send parent summaries every Friday at 4 PM.",
  },
  {
    title: "Late Work Nudge",
    detail: "Remind students after 48 hours of inactivity.",
  },
  {
    title: "Assessment Mastery Alerts",
    detail: "Notify when mastery drops below 70%.",
  },
]

export default function PremiumDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.2))]" />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                Premium Workspace
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Instructor Command Center
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                A focused space for instructors to manage students, track learning progress,
                and automate follow-ups without drowning in tabs.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/create-quiz"
                className="bg-primary text-primary-foreground px-5 py-2 font-semibold shadow-sm hover:bg-primary/90"
              >
                + New Assessment
              </Link>
              <Link
                href="/automation"
                className="bg-secondary text-secondary-foreground px-5 py-2 font-semibold hover:bg-secondary/80"
              >
                Automation Hub
              </Link>
              <Link
                href="/pricing"
                className="border border-border px-5 py-2 font-semibold text-foreground hover:bg-secondary"
              >
                Manage Plan
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => (
            <div key={item.label} className="card p-5 space-y-2">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <div className="text-3xl font-semibold text-foreground">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.trend}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Classes at a glance</h2>
                <p className="text-sm text-muted-foreground">
                  Track engagement and completion across your classrooms.
                </p>
              </div>
              <Link href="/created-quiz" className="text-sm text-primary hover:underline">
                View all classes
              </Link>
            </div>
            <div className="mt-6 grid gap-3">
              {classes.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-background/60 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-lg font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.students} students · Last activity {item.lastActivity}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">Completion</div>
                    <div className="text-xl font-semibold text-foreground">{item.completion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Student pulse</h2>
              <p className="text-sm text-muted-foreground">
                Premium insights highlight who needs attention today.
              </p>
            </div>
            <div className="space-y-4">
              {progressSignals.map((item) => (
                <div key={item.student} className="rounded-[var(--radius-card)] border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{item.student}</p>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{item.detail}</p>
                </div>
              ))}
            </div>
            <Link href="/joined-quiz" className="text-sm text-primary hover:underline">
              Open student roster
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card p-6 space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Automation + insights</h2>
              <p className="text-sm text-muted-foreground">
                Premium workflows that save time and keep families in the loop.
              </p>
            </div>
            <div className="grid gap-3">
              {automations.map((item) => (
                <div key={item.title} className="rounded-[var(--radius-card)] border border-border p-4">
                  <p className="text-base font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-2">{item.detail}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/automation"
                className="bg-primary text-primary-foreground px-4 py-2 font-semibold hover:bg-primary/90"
              >
                Configure automations
              </Link>
              <button className="border border-border px-4 py-2 font-semibold text-foreground hover:bg-secondary">
                Export reports
              </button>
            </div>
          </div>

          <div className="card p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Upcoming actions</h2>
              <p className="text-sm text-muted-foreground">
                Priority tasks based on student behavior.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-[var(--radius-card)] border border-border p-4">
                <p className="font-semibold text-foreground">Schedule 1:1 check-ins</p>
                <p className="text-sm text-muted-foreground mt-2">
                  3 students flagged for low engagement in Algebra II.
                </p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-border p-4">
                <p className="font-semibold text-foreground">Publish next assessment</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Recommended window: Wednesday 9:00 AM for World History.
                </p>
              </div>
              <div className="rounded-[var(--radius-card)] border border-border p-4">
                <p className="font-semibold text-foreground">Send progress note</p>
                <p className="text-sm text-muted-foreground mt-2">
                  12 parents haven’t received updates this month.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Resource center</h2>
              <p className="text-sm text-muted-foreground">
                Templates and pro tips to boost student outcomes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="border border-border px-4 py-2 font-semibold text-foreground hover:bg-secondary">
                Download rubric pack
              </button>
              <button className="border border-border px-4 py-2 font-semibold text-foreground hover:bg-secondary">
                Share class link
              </button>
              <button className="border border-border px-4 py-2 font-semibold text-foreground hover:bg-secondary">
                Invite co-teacher
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
