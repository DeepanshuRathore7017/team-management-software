// Accessible by Admin and Team Members of that team
import postgres from "postgres";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

type MemberRole = "team_lead" | "team_member";
type ProjectStatus = "active" | "overdue" | "pending" | "completed" | "none";
type TaskStatus    = "active" | "overdue" | "pending" | "completed" | "none";

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

const avatarColors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-cyan-500",
    "bg-amber-500",
    "bg-pink-500",
  ];

const PROJECT_STATUS_CFG: Record<ProjectStatus, { label: string; pill: string; bar: string }> = {
  active:    { label: "Active",     pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", bar: "from-blue-500 to-blue-400" },
  overdue:   { label: "Overdue",    pill: "bg-red-500/20 text-red-300 border-red-500/30",             bar: "from-red-500 to-red-400" },
  pending:   { label: "Pending",    pill: "bg-slate-700/60 text-slate-400 border-slate-600/30",       bar: "from-slate-600 to-slate-500" },
  completed: { label: "Completed",  pill: "bg-violet-500/20 text-violet-300 border-violet-500/30",    bar: "from-emerald-500 to-emerald-400" },
  none:      { label: "Unassigned", pill: "bg-amber-500/15 text-amber-400 border-amber-500/20",       bar: "from-slate-600 to-slate-500" },
};

const TASK_STATUS_CFG: Record<TaskStatus, { label: string; pill: string; dot: string }> = {
  completed:        { label: "Completed",        pill: "bg-emerald-500/20 text-emerald-300", dot: "bg-emerald-400" },
  active: { label: "Active", pill: "bg-blue-500/20 text-blue-300",       dot: "bg-blue-400" },
  pending:        { label: "Pending",       pill: "bg-slate-700/60 text-slate-400",     dot: "bg-slate-500" },
  overdue:        { label: "Overdue",       pill: "bg-red-500/20 text-red-400",     dot: "bg-slate-500" },
  none:        { label: "Unassigned",       pill: "bg-amber-500/15 text-amber-400",     dot: "bg-slate-500" },
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

export default async function TeamDetail({
  params,
}: {
  params: Promise<{ team_id: string }>;
}) {
  const { team_id } = await params;
  // team
  const [team] = await sql`
    SELECT *
    FROM teams
    WHERE id = ${team_id}
    LIMIT 1
  `;

  if (!team) {
    throw new Error("Team not found");
  }

  // members
  const memberRows = await sql`
    SELECT *
    FROM employees
    WHERE team_id = ${team_id}
  `;

  
  const members: Member[] = [];

  for (const [index, m] of memberRows.entries()) {
    const assignedRows = await sql`
      SELECT COUNT(*)
      FROM tasks
      WHERE assigned_emp_email = ${m.email}
    `;

    const doneRows = await sql`
      SELECT COUNT(*)
      FROM tasks
      WHERE assigned_emp_email = ${m.email}
      AND status = 'completed'
    `;

    members.push({
      id: m.id,
      name: m.name,
      initial: m.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase(),

      color: avatarColors[index % avatarColors.length],
      role: m.role,
      designation: m.position || "Developer",
      email: m.email,
      joinedTeam: m.joined_team?.toLocaleDateString() || "",
      tasksAssigned: Number(assignedRows[0].count),
      tasksDone: Number(doneRows[0].count),
    });
  }

  // lead
  const lead = members.find((m) => m.role === "team_lead") || members[0];

  // project
  const [project] = await sql`SELECT * FROM projects WHERE team_id = ${team_id} LIMIT 1`;

  // recent tasks
  const recentTaskRows = project
    ? await sql`
        SELECT *
        FROM tasks
        WHERE project_id = ${project.id}
        ORDER BY date_of_creation DESC
        LIMIT 5
      `
    : [];

  const recentTasks: TaskSummary[] =
    recentTaskRows.map(
      (task: any, index: number) => {
        const assigneeInitial = task.assigned_emp_email
          ?.split(" ")
          .map((w: string) => w[0])
          .join("")
          .toUpperCase();

        const isOverdue =
          task.status !== "completed" &&
          new Date(task.deadline) < new Date();

        return {
          id: task.id,
          name: task.name,
          assignee: task.assigned_emp_email,
          assigneeInitial,
          assigneeColor: avatarColors[index % avatarColors.length],
          deadline: task.deadline?.toLocaleDateString() || "",
          status: isOverdue ? "overdue" : task.status,
          isOverdue,
        };
      }
    );

  // counts
  const [{ open }] = project
    ? await sql`
        SELECT COUNT(*) AS open
        FROM tasks
        WHERE project_id = ${project.id}
        AND status != 'completed'
      `
    : [{ open: 0 }];

  const [{ done }] = project
    ? await sql`
        SELECT COUNT(*) AS done
        FROM tasks
        WHERE project_id = ${project.id}
        AND status = 'completed'
      `
    : [{ done: 0 }];

  const [{ overdue }] = project
    ? await sql`
        SELECT COUNT(*) AS overdue
        FROM tasks
        WHERE project_id = ${project.id}
        AND deadline < NOW()
        AND status != 'completed'
      `
    : [{ overdue: 0 }];

  let projectStatus =(project?.status as ProjectStatus) || "pending";

  if (
    projectStatus !== "completed" &&
    project &&
    new Date(project.deadline) < new Date()
  ) {
    projectStatus = "overdue";
  }

  const teamDetail: TeamDetail = {
    id: team.id,
    name: team.name,
    lead,
    members,
    project: project?.name || "No Project",
    projectId: project?.id || "",
    projectStatus,
    projectDeadline: project?.deadline?.toLocaleDateString() || "",
    projectProgress: Number(project?.progress || 0),
    recentTasks,
    taskCounts: {
      open: Number(open),
      done: Number(done),
      overdue: Number(overdue),
    },
  };

  const isAdmin = true; // replace with sessionStorage role check
  const pCfg    = PROJECT_STATUS_CFG[teamDetail.projectStatus];
  const allMembers = [teamDetail.lead, ...teamDetail.members];

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">

      <main className="mx-auto max-w-5xl px-7 py-10">

        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-1.5 text-[12px] text-slate-500">
          <a href="/teams" className="text-blue-400 hover:text-blue-300">Teams</a>
          <span>›</span>
          <span className="text-slate-400">{teamDetail.name}</span>
        </div>

        {/* Hero */}
        <div className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-bold text-white">{teamDetail.name}</h1>
              <p className="mt-1 text-[13px] text-slate-500">
                {/*   to be edited later */}
                {teamDetail.members.length}  members
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
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white ${teamDetail.lead.color}`}>
              {teamDetail.lead.initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-semibold text-white">{teamDetail.lead.name}</p>
                <span className="rounded-full bg-blue-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300">TEAM LEAD</span>
              </div>
              <p className="text-[12px] text-slate-500">{teamDetail.lead.designation} · {teamDetail.lead.email}</p>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Open Tasks",  value: teamDetail.taskCounts.open,    cls: "border-blue-500/20 bg-blue-500/[0.07] text-blue-300" },
              { label: "Completed",   value: teamDetail.taskCounts.done,    cls: "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300" },
              { label: "Overdue",     value: teamDetail.taskCounts.overdue, cls: "border-red-500/20 bg-red-500/[0.07] text-red-300" },
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
              <p className="text-[13px] font-semibold text-white">Members ({teamDetail.members.length})</p>
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
              {teamDetail.members.map((m) => (
                <MemberRow key={m.id} member={m} isAdmin={isAdmin} />
              ))}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4">

            {/* Assigned project */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <p className="mb-4 text-[13px] font-semibold text-white">Assigned project</p>

              {teamDetail.projectId ? (
                <>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <a href={`/projects/${teamDetail.projectId}`} className="text-[14px] font-bold text-blue-300 hover:text-blue-200">
                      {teamDetail.project}
                    </a>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${pCfg.pill}`}>{pCfg.label}</span>
                  </div>
                  <div className="mb-3 flex flex-col gap-2 text-[12px] text-slate-500">
                    <span>🎯 Deadline: <span className="text-amber-300 font-medium">{teamDetail.projectDeadline}</span></span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${pCfg.bar}`}
                      style={{ width: `${teamDetail.projectProgress}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[11px] text-slate-600">
                    <span>{teamDetail.projectProgress}% complete</span>
                    <a href={`/projects/${teamDetail.projectId}/tasks`} className="text-blue-400 hover:text-blue-300">View tasks →</a>
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

              {teamDetail.recentTasks.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {teamDetail.recentTasks.map((t) => {
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