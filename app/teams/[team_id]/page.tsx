// TeamDetail.tsx — /teams/[team_id]
// Accessible by Admin and Team Members of that team

type MemberRole = "team_lead" | "team_member";
type ProjectStatus = "active" | "overdue" | "pending" | "completed" | "none";
type TaskStatus    = "todo" | "in_progress" | "done";

interface Member {
  id: string;
  name: string;
  initial: string;
  color: string;
  role: MemberRole;
  designation: string;
  email: string;
  joinedTeam: string;
  tasksAssigned: number;
  tasksDone: number;
}

interface TaskSummary {
  id: string;
  name: string;
  assignee: string;
  assigneeInitial: string;
  assigneeColor: string;
  deadline: string;
  status: TaskStatus;
  isOverdue: boolean;
}

interface TeamDetail {
  id: string;
  name: string;
  createdAt: string;
  lead: Member;
  members: Member[];
  project: string;
  projectId: string;
  projectStatus: ProjectStatus;
  projectDeadline: string;
  projectProgress: number;
  recentTasks: TaskSummary[];
  taskCounts: { open: number; done: number; overdue: number };
}

const MOCK_TEAM: TeamDetail = {
  id: "team-alpha",
  name: "Team Alpha",
  createdAt: "Jan 5, 2025",
  lead: {
    id: "e1",
    name: "Rahul Verma",
    initial: "R",
    color: "bg-violet-500",
    role: "team_lead",
    designation: "Senior Backend Engineer",
    email: "rahul@ethara.ai",
    joinedTeam: "Jan 5, 2025",
    tasksAssigned: 4,
    tasksDone: 3,
  },
  members: [
    { id: "e2", name: "Sneha Kulkarni", initial: "S", color: "bg-cyan-500",    role: "team_member", designation: "Frontend Developer",  email: "sneha@ethara.ai",  joinedTeam: "Jan 8, 2025",  tasksAssigned: 3, tasksDone: 2 },
    { id: "e3", name: "Vikram Das",     initial: "V", color: "bg-emerald-500", role: "team_member", designation: "Backend Developer",   email: "vikram@ethara.ai", joinedTeam: "Jan 8, 2025",  tasksAssigned: 4, tasksDone: 3 },
    { id: "e4", name: "Kavya Menon",    initial: "K", color: "bg-amber-500",   role: "team_member", designation: "QA Engineer",        email: "kavya@ethara.ai",  joinedTeam: "Jan 10, 2025", tasksAssigned: 2, tasksDone: 2 },
    { id: "e5", name: "Arjun Patel",    initial: "A", color: "bg-rose-500",    role: "team_member", designation: "DevOps Engineer",    email: "arjun@ethara.ai",  joinedTeam: "Jan 12, 2025", tasksAssigned: 2, tasksDone: 1 },
    { id: "e6", name: "Nisha Reddy",    initial: "N", color: "bg-blue-500",    role: "team_member", designation: "UI Designer",        email: "nisha@ethara.ai",  joinedTeam: "Jan 15, 2025", tasksAssigned: 3, tasksDone: 1 },
    { id: "e7", name: "Pranav Shah",    initial: "P", color: "bg-teal-500",    role: "team_member", designation: "Full-Stack Dev",     email: "pranav@ethara.ai", joinedTeam: "Feb 1, 2025",  tasksAssigned: 2, tasksDone: 2 },
    { id: "e8", name: "Jaya Iyer",      initial: "J", color: "bg-pink-500",    role: "team_member", designation: "QA Analyst",        email: "jaya@ethara.ai",   joinedTeam: "Feb 5, 2025",  tasksAssigned: 1, tasksDone: 1 },
  ],
  project: "Ethara Platform v2",
  projectId: "1",
  projectStatus: "active",
  projectDeadline: "Jun 30, 2025",
  projectProgress: 62,
  taskCounts: { open: 6, done: 9, overdue: 1 },
  recentTasks: [
    { id: "t1", name: "Design auth flow",       assignee: "Sneha K.", assigneeInitial: "S", assigneeColor: "bg-cyan-500",    deadline: "Feb 10", status: "done",        isOverdue: false },
    { id: "t2", name: "Build REST API",          assignee: "Vikram D.",assigneeInitial: "V", assigneeColor: "bg-emerald-500", deadline: "Jun 18", status: "in_progress", isOverdue: false },
    { id: "t3", name: "Integrate payment gateway",assignee:"Arjun P.", assigneeInitial: "A", assigneeColor: "bg-rose-500",   deadline: "May 1",  status: "in_progress", isOverdue: true  },
    { id: "t4", name: "Write unit tests",        assignee: "Jaya I.",  assigneeInitial: "J", assigneeColor: "bg-pink-500",   deadline: "Jun 25", status: "todo",        isOverdue: false },
    { id: "t5", name: "CI/CD pipeline",          assignee: "Kavya M.", assigneeInitial: "K", assigneeColor: "bg-amber-500",  deadline: "Jun 10", status: "done",        isOverdue: false },
  ],
};

const PROJECT_STATUS_CFG: Record<ProjectStatus, { label: string; pill: string; bar: string }> = {
  active:    { label: "Active",     pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", bar: "from-blue-500 to-blue-400" },
  overdue:   { label: "Overdue",    pill: "bg-red-500/20 text-red-300 border-red-500/30",             bar: "from-red-500 to-red-400" },
  pending:   { label: "Pending",    pill: "bg-slate-700/60 text-slate-400 border-slate-600/30",       bar: "from-slate-600 to-slate-500" },
  completed: { label: "Completed",  pill: "bg-violet-500/20 text-violet-300 border-violet-500/30",    bar: "from-emerald-500 to-emerald-400" },
  none:      { label: "Unassigned", pill: "bg-amber-500/15 text-amber-400 border-amber-500/20",       bar: "from-slate-600 to-slate-500" },
};

const TASK_STATUS_CFG: Record<TaskStatus, { label: string; pill: string; dot: string }> = {
  done:        { label: "Done",        pill: "bg-emerald-500/20 text-emerald-300", dot: "bg-emerald-400" },
  in_progress: { label: "In Progress", pill: "bg-blue-500/20 text-blue-300",       dot: "bg-blue-400" },
  todo:        { label: "To Do",       pill: "bg-slate-700/60 text-slate-400",     dot: "bg-slate-500" },
};

// ─── Member Row ───────────────────────────────────────────────────────────────

function MemberRow({ member, isAdmin }: { member: Member; isAdmin: boolean }) {
  const completionPct = member.tasksAssigned > 0
    ? Math.round((member.tasksDone / member.tasksAssigned) * 100)
    : 0;

  return (
    <div className="group flex items-center gap-4 rounded-xl px-1 py-3 transition-colors hover:bg-white/[0.02]">
      {/* Avatar */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white ${member.color}`}>
        {member.initial}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-white">{member.name}</p>
          {member.role === "team_lead" && (
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">LEAD</span>
          )}
        </div>
        <p className="text-[12px] text-slate-500">{member.designation} · {member.email}</p>
      </div>

      {/* Task progress */}
      <div className="hidden w-28 sm:block">
        <div className="mb-1 flex justify-between text-[11px] text-slate-500">
          <span>{member.tasksDone}/{member.tasksAssigned} tasks</span>
          <span>{completionPct}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Joined */}
      <p className="hidden w-24 shrink-0 text-right text-[12px] text-slate-600 lg:block">{member.joinedTeam}</p>

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-400 hover:bg-white/[0.1] hover:text-white">Edit</button>
          <button className="rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400 hover:bg-red-500/20">Remove</button>
        </div>
      )}
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function TeamDetail() {
  const team    = MOCK_TEAM;
  const isAdmin = true; // replace with sessionStorage role check
  const pCfg    = PROJECT_STATUS_CFG[team.projectStatus];
  const allMembers = [team.lead, ...team.members];

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">

      <main className="mx-auto max-w-5xl px-7 py-10">

        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-1.5 text-[12px] text-slate-500">
          <a href="/teams" className="text-blue-400 hover:text-blue-300">Teams</a>
          <span>›</span>
          <span className="text-slate-400">{team.name}</span>
        </div>

        {/* Hero */}
        <div className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-bold text-white">{team.name}</h1>
              <p className="mt-1 text-[13px] text-slate-500">
                Created {team.createdAt} · {allMembers.length} members
              </p>
            </div>
            {isAdmin && (
              <div className="flex shrink-0 gap-2">
                <button className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-slate-400 hover:bg-white/[0.08] hover:text-white transition-all">
                  ✏️ Edit Team
                </button>
                <button className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[12px] font-medium text-blue-300 hover:bg-blue-500/20 transition-all">
                  ＋ Add Member
                </button>
              </div>
            )}
          </div>

          {/* Team lead highlight */}
          <div className="mb-5 flex items-center gap-3.5 rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white ${team.lead.color}`}>
              {team.lead.initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold text-white">{team.lead.name}</p>
                <span className="rounded-full bg-blue-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300">TEAM LEAD</span>
              </div>
              <p className="text-[12px] text-slate-500">{team.lead.designation} · {team.lead.email}</p>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Open Tasks",  value: team.taskCounts.open,    cls: "border-blue-500/20 bg-blue-500/[0.07] text-blue-300" },
              { label: "Completed",   value: team.taskCounts.done,    cls: "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300" },
              { label: "Overdue",     value: team.taskCounts.overdue, cls: "border-red-500/20 bg-red-500/[0.07] text-red-300" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border px-3 py-3 text-center ${s.cls}`}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="mt-0.5 text-[11px] opacity-75">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">

          {/* ── Members list ── */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-white">Members ({allMembers.length})</p>
              {isAdmin && (
                <button className="text-[12px] text-blue-400 hover:text-blue-300">Manage →</button>
              )}
            </div>

            {/* Column labels */}
            <div className="mb-2 flex items-center gap-4 px-1 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
              <span className="flex-1">Employee</span>
              <span className="hidden w-28 sm:block">Task progress</span>
              <span className="hidden w-24 text-right lg:block">Joined</span>
              {isAdmin && <span className="w-20" />}
            </div>

            <div className="divide-y divide-white/[0.04]">
              <MemberRow member={team.lead} isAdmin={isAdmin} />
              {team.members.map((m) => (
                <MemberRow key={m.id} member={m} isAdmin={isAdmin} />
              ))}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4">

            {/* Assigned project */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <p className="mb-4 text-[13px] font-semibold text-white">Assigned project</p>

              {team.projectId ? (
                <>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <a href={`/projects/${team.projectId}`} className="text-[14px] font-bold text-blue-300 hover:text-blue-200">
                      {team.project}
                    </a>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${pCfg.pill}`}>{pCfg.label}</span>
                  </div>
                  <div className="mb-3 flex flex-col gap-2 text-[12px] text-slate-500">
                    <span>🎯 Deadline: <span className="text-amber-300 font-medium">{team.projectDeadline}</span></span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${pCfg.bar}`}
                      style={{ width: `${team.projectProgress}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-600">
                    <span>{team.projectProgress}% complete</span>
                    <a href={`/projects/${team.projectId}/tasks`} className="text-blue-400 hover:text-blue-300">View tasks →</a>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-5 text-center">
                  <p className="text-2xl mb-2">📭</p>
                  <p className="text-[13px] text-amber-400 font-medium">No project assigned</p>
                  <p className="mt-1 text-[12px] text-slate-500">Admin will assign a project soon</p>
                  {isAdmin && (
                    <button className="mt-3 rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 text-[12px] font-semibold text-blue-300 hover:bg-blue-500/30 transition-all">
                      Assign Project
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Recent tasks */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-white">Recent tasks</p>
                {team.projectId && (
                  <a href={`/projects/${team.projectId}/tasks`} className="text-[12px] text-blue-400 hover:text-blue-300">
                    All tasks →
                  </a>
                )}
              </div>

              {team.recentTasks.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {team.recentTasks.map((t) => {
                    const ts = TASK_STATUS_CFG[t.status];
                    return (
                      <div key={t.id} className="flex items-center gap-2.5 py-2.5">
                        <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${ts.dot}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-white">{t.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ${t.assigneeColor}`}>
                              {t.assigneeInitial}
                            </div>
                            <span className="text-[11px] text-slate-500">{t.assignee}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ts.pill}`}>{ts.label}</span>
                          <p className={`mt-0.5 text-[10px] ${t.isOverdue ? "text-red-400" : "text-slate-600"}`}>
                            {t.isOverdue ? "⚠ " : ""}{t.deadline}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-[13px] text-slate-600 py-4">No tasks yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}