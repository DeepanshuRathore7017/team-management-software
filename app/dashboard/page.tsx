// Dashboard.tsx
// Role-based dashboard — swap `role` inside mockUser to preview different views

import Link from "next/link";

type Role = "admin" | "team_lead" | "team_member" | "on_bench";

const mockUser = {
  name: "Aryan Sharma",
  email: "aryan@ethara.ai",
  role: "admin" as Role,
  avatar: "A",
};



// ─── Shared components ────────────────────────────────────────────────────────

function StatCard({ label, value, icon, accent }: { label: string; value: number | string; icon: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.05]">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg ${accent}`}>{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-[12px] text-slate-500">{label}</p>
    </div>
  );
}

function QuickLink({ label, sub, icon, href }: { label: string; sub: string; icon: string; href: string }) {
  return (
    <Link href={href} className="group flex cursor-pointer items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 transition-all duration-200 hover:border-blue-500/40 hover:bg-blue-500/[0.05]">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="text-[14px] font-semibold text-white group-hover:text-blue-300">{label}</p>
        <p className="text-[12px] text-slate-500">{sub}</p>
      </div>
      <span className="text-slate-600 transition-colors group-hover:text-blue-400">→</span>
    </Link>
  );
}

type TaskStatus = "todo" | "in_progress" | "done";

function TaskRow({ title, project, deadline, status }: { title: string; project: string; deadline: string; status: TaskStatus }) {
  const s: Record<TaskStatus, { label: string; cls: string }> = {
    todo:        { label: "To Do",       cls: "bg-slate-700/60 text-slate-300" },
    in_progress: { label: "In Progress", cls: "bg-blue-500/20 text-blue-300" },
    done:        { label: "Done",        cls: "bg-emerald-500/20 text-emerald-300" },
  };
  return (
    <div className="flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-white/[0.02]">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-white">{title}</p>
        <p className="text-[11px] text-slate-500">{project}</p>
      </div>
      <span className="shrink-0 text-[11px] text-slate-500">{deadline}</span>
      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s[status].cls}`}>{s[status].label}</span>
    </div>
  );
}

// ─── Role-specific widget sets ────────────────────────────────────────────────

function AdminWidgets() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Projects" value={12} icon="📁" accent="bg-violet-500/20 text-violet-300" />
        <StatCard label="Active Teams"   value={5}  icon="👥" accent="bg-blue-500/20 text-blue-300" />
        <StatCard label="Employees"      value={34} icon="🧑‍💼" accent="bg-cyan-500/20 text-cyan-300" />
        <StatCard label="On Bench"       value={6}  icon="⏸️" accent="bg-amber-500/20 text-amber-300" />
      </div>

      <div>
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-widest text-slate-500">Quick actions</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuickLink label="Manage Projects" sub="View, create and assign projects" icon="📁" href="/projects" />
          <QuickLink label="Manage Teams"    sub="Create teams and assign members"  icon="👥" href="/teams" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-white">Recent projects</p>
          <a href="/projects" className="text-[12px] text-blue-400 hover:text-blue-300">View all →</a>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {[
            { name: "Ethara Platform v2",  team: "Team Alpha · 8 members", due: "Jun 30", cls: "bg-emerald-500/20 text-emerald-300", label: "Active"  },
            { name: "Mobile App Redesign", team: "Team Beta · 5 members",  due: "Jul 15", cls: "bg-blue-500/20 text-blue-300",       label: "Active"  },
            { name: "Analytics Dashboard", team: "Team Gamma · 6 members", due: "May 20", cls: "bg-red-500/20 text-red-300",         label: "Overdue" },
            { name: "API Gateway v3",      team: "Unassigned",             due: "Aug 1",  cls: "bg-slate-700/60 text-slate-400",     label: "Pending" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-white">{p.name}</p>
                <p className="text-[11px] text-slate-500">{p.team}</p>
              </div>
              <span className="text-[11px] text-slate-500">Due {p.due}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${p.cls}`}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TeamLeadWidgets() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Team Size"  value={8}  icon="👥" accent="bg-cyan-500/20 text-cyan-300" />
        <StatCard label="Open Tasks" value={15} icon="📋" accent="bg-blue-500/20 text-blue-300" />
        <StatCard label="Overdue"    value={3}  icon="⚠️" accent="bg-rose-500/20 text-rose-300" />
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-white">Assigned project</p>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">Active</span>
        </div>
        <p className="mt-2 text-lg font-bold text-blue-300">Ethara Platform v2</p>
        <p className="mt-1 text-[12px] text-slate-500">Deadline: Jun 30, 2025</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
        </div>
        <p className="mt-1.5 text-right text-[11px] text-slate-500">62% complete</p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <p className="mb-3 text-[13px] font-semibold text-white">Recent tasks</p>
        <div className="divide-y divide-white/[0.04]">
          <TaskRow title="Design auth flow" project="Ethara Platform v2" deadline="Jun 10" status="done" />
          <TaskRow title="Build REST API"   project="Ethara Platform v2" deadline="Jun 18" status="in_progress" />
          <TaskRow title="Write unit tests" project="Ethara Platform v2" deadline="Jun 25" status="todo" />
        </div>
      </div>
    </>
  );
}

function TeamMemberWidgets() {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="My Tasks"    value={6} icon="📋" accent="bg-blue-500/20 text-blue-300" />
        <StatCard label="In Progress" value={2} icon="🔄" accent="bg-cyan-500/20 text-cyan-300" />
        <StatCard label="Overdue"     value={1} icon="⚠️" accent="bg-rose-500/20 text-rose-300" />
      </div>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <p className="mb-3 text-[13px] font-semibold text-white">My tasks</p>
        <div className="divide-y divide-white/[0.04]">
          <TaskRow title="Build REST API"   project="Ethara Platform v2" deadline="Jun 18" status="in_progress" />
          <TaskRow title="Fix login bug"    project="Ethara Platform v2" deadline="Jun 12" status="in_progress" />
          <TaskRow title="Write unit tests" project="Ethara Platform v2" deadline="Jun 25" status="todo" />
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <p className="mb-3 text-[13px] font-semibold text-white">My team</p>
        <div className="divide-y divide-white/[0.04]">
         {/* dynamic team id to be addedd later */}
          <QuickLink label="My Team"    sub=""  icon="👥" href="/teams/1" />   
        </div>
      </div>
    </>
  );
}

function OnBenchWidgets() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] px-8 py-20 text-center">
      <span className="mb-5 text-5xl">⏸️</span>
      <h3 className="text-xl font-bold text-white">You're currently on bench</h3>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-slate-400">You haven't been assigned to a team yet. Your admin will assign you soon.</p>
      <p className="mt-4 text-[12px] text-slate-600">Contact: info@ethara.ai</p>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const user = mockUser; // In real app: JSON.parse(sessionStorage.getItem("user"))
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <main className="mx-auto max-w-5xl px-7 py-10">
        <div className="mb-8">
          <p className="text-[12px] uppercase tracking-widest text-slate-600">{greeting},</p>
          <h1 className="mt-1 text-[28px] font-bold text-white">{user.name}</h1>
          <p className="mt-1 text-[13px] text-slate-500">{user.email}</p>
        </div>
        <div className="flex flex-col gap-6">
          {user.role === "admin"       && <AdminWidgets />}
          {user.role === "team_lead"   && <TeamLeadWidgets />}
          {user.role === "team_member" && <TeamMemberWidgets />}
          {user.role === "on_bench"    && <OnBenchWidgets />}
        </div>
      </main>
    </div>
  );
}