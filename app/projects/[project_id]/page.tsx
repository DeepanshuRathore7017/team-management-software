// ProjectDetail.tsx — /projects/[project_id]
// Accessible by Admin and Team Members

import postgres from "postgres";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

type ProjectStatus = "active" | "overdue" | "pending" | "completed";
type TaskStatus    = "active" | "overdue" | "pending" | "completed";

interface Member {
  initial: string;
  color: string;
  name: string;
  role: string;
}

interface TaskSummary {
  id: string;
  name: string;
  assignee: string;
  status: TaskStatus;
}

interface ProjectDetail {
  id: string;
  name: string;
  desc: string;
  status: ProjectStatus;
  team: string;
  teamLead: string;
  createdAt: string;
  assignedAt: string;
  deadline: string;
  progress: number;
  members: Member[];
  tasks: TaskSummary[];
  taskCounts: { completed: number; active: number; pending: number };
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


// const MOCK_PROJECT: ProjectDetail = {
//   id: "1",
//   name: "Ethara Platform v2",
//   desc: "Full platform overhaul including new REST API layer, authentication redesign, and admin tooling. Covers backend services, frontend components, and QA validation across all modules.",
//   status: "active",
//   team: "Team Alpha",
//   teamLead: "Rahul Verma",
//   createdAt: "Jan 10, 2025",
//   assignedAt: "Jan 15, 2025",
//   deadline: "Jun 30, 2025",
//   progress: 62,
//   taskCounts: { done: 9, inProgress: 4, todo: 2 },
//   members: [
//     { initial: "R", color: "bg-violet-500", name: "Rahul Verma",    role: "Team Lead" },
//     { initial: "S", color: "bg-cyan-500",   name: "Sneha Kulkarni", role: "Frontend Dev" },
//     { initial: "V", color: "bg-emerald-500",name: "Vikram Das",     role: "Backend Dev" },
//     { initial: "K", color: "bg-amber-500",  name: "Kavya Menon",    role: "QA Engineer" },
//     { initial: "A", color: "bg-rose-500",   name: "Arjun Patel",    role: "DevOps" },
//     { initial: "N", color: "bg-blue-500",   name: "Nisha Reddy",    role: "UI Designer" },
//     { initial: "P", color: "bg-teal-500",   name: "Pranav Shah",    role: "Backend Dev" },
//     { initial: "J", color: "bg-pink-500",   name: "Jaya Iyer",      role: "Tester" },
//   ],
//   tasks: [
//     { id: "t1", name: "Design auth flow",       assignee: "Sneha K.",  status: "done" },
//     { id: "t2", name: "Build REST API",          assignee: "Vikram D.", status: "in_progress" },
//     { id: "t3", name: "Write unit tests",        assignee: "Unassigned",status: "todo" },
//     { id: "t4", name: "Set up CI/CD pipeline",   assignee: "Kavya M.",  status: "done" },
//     { id: "t5", name: "Dashboard UI components", assignee: "Sneha K.",  status: "in_progress" },
//   ],
// };

const STATUS_CONFIG: Record<ProjectStatus, { label: string; pill: string; bar: string }> = {
  active:    { label: "Active",    pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", bar: "from-blue-500 to-blue-400" },
  overdue:   { label: "Overdue",   pill: "bg-red-500/20 text-red-300 border-red-500/30",             bar: "from-red-500 to-red-400" },
  pending:   { label: "Pending",   pill: "bg-slate-700/60 text-slate-400 border-slate-600/30",       bar: "from-slate-600 to-slate-500" },
  completed: { label: "Completed", pill: "bg-violet-500/20 text-violet-300 border-violet-500/30",    bar: "from-emerald-500 to-emerald-400" },
};

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; cls: string; dot: string }> = {
  completed:        { label: "Completed",        cls: "bg-emerald-500/20 text-emerald-300", dot: "bg-emerald-400" },
  active: { label: "Active", cls: "bg-blue-500/20 text-blue-300",       dot: "bg-blue-400" },
  pending:        { label: "Pending",       cls: "bg-slate-700/60 text-slate-400",     dot: "bg-slate-500" },
  overdue:        { label: "Overdue",       cls: "bg-red-500/20 text-red-400",     dot: "bg-slate-500" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────


function MetaItem({ label, value, valueClass = "text-slate-200" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-600">{label}</p>
      <p className={`text-[13px] font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default async function ProjectDetail({
  params
} : {
  params: Promise<{ project_id: string }>;
}) {
  const {project_id} = await params;

  // project
  const [prj] = await sql`
    SELECT *
    FROM projects
    WHERE id = ${project_id}
    LIMIT 1
  `;

  if (!prj) {
    throw new Error("Project not found");
  }

  // team lead
  const [leadRow] = await sql`
    SELECT name
    FROM employees
    WHERE team_id = ${prj.team_id}
    AND role = 'team_lead'
    LIMIT 1
  `;

  const teamLead = leadRow?.name || "No Lead";

  // members
  const memberRows = await sql`
    SELECT name, role
    FROM employees
    WHERE team_id = ${prj.team_id}
  `;

  const members = memberRows.map((m: any, i: number) => ({
    name: m.name,
    role: m.role,
    initial: m.name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase(),
    color: avatarColors[i % avatarColors.length],
  }));

  // tasks
  const taskRows = await sql`
    SELECT id, name, assigned_emp_email, status, deadline
    FROM tasks
    WHERE project_id = ${prj.id}
  `;

  const tasks = taskRows.map((t: any) => {
    let taskStatus = t.status as TaskStatus;

    if (
      taskStatus !== "completed" &&
      new Date(t.deadline) < new Date()
    ) {
      taskStatus = "overdue";
    }

    return {
      id: t.id,
      name: t.name,
      assignee: t.assigned_emp_email,
      status: taskStatus,
    };
  });

  // task counts
  const [{ complted }] = await sql`
    SELECT COUNT(*) AS complted
    FROM tasks
    WHERE project_id = ${prj.id}
    AND status = 'completed'
  `;

  const [{ active }] = await sql`
    SELECT COUNT(*) AS active
    FROM tasks
    WHERE project_id = ${prj.id}
    AND status = 'active'
  `;

  const [{ pending }] = await sql`
    SELECT COUNT(*) AS pending
    FROM tasks
    WHERE project_id = ${prj.id}
    AND status = 'pending'
  `;

  let status = prj.status as ProjectStatus;

  if (status !== "completed" && new Date(prj.deadline) < new Date()) {
    status = "overdue";
  }

  const p: ProjectDetail = {
    id: prj.id,
    name: prj.name,
    desc: prj.description,
    status,
    team: prj.team_name,
    teamLead,
    createdAt: prj.date_of_creation?.toLocaleDateString() || "",
    assignedAt: prj.date_of_assigning?.toLocaleDateString() || "",
    deadline: prj.deadline?.toLocaleDateString() || "",
    progress: Number(prj.progress),

    members,
    tasks,

    taskCounts: {
      completed: Number(complted),
      active: Number(active),
      pending: Number(pending),
    },
  };


  const cfg = STATUS_CONFIG[status];

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">

      <main className="mx-auto max-w-5xl px-7 py-10">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-1.5 text-[12px] text-slate-500">
          <a href="/projects" className="text-blue-400 hover:text-blue-300">Projects</a>
          <span>›</span>
          <span className="text-slate-400">{p.name}</span>
        </div>

        {/* Hero card */}
        <div className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-[22px] font-bold text-white">{p.name}</h1>
                <span className={`rounded-full border px-3 py-0.5 text-[11px] font-semibold ${cfg.pill}`}>{cfg.label}</span>
              </div>
              <p className="max-w-2xl text-[13px] leading-relaxed text-slate-400">{p.desc}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-slate-400 hover:bg-white/[0.08] hover:text-white transition-all">
                ✏️ Edit
              </button>
              <button className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[12px] font-medium text-red-400 hover:bg-red-500/20 transition-all">
                🗑 Delete
              </button>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-white/[0.05] pt-5 sm:grid-cols-3 lg:grid-cols-6">
            <MetaItem label="Created"   value={p.createdAt} />
            <MetaItem label="Assigned"  value={p.assignedAt} />
            <MetaItem label="Deadline"  value={p.deadline} valueClass="text-amber-300" />
            <MetaItem label="Team"      value={p.team} valueClass="text-blue-300" />
            <MetaItem label="Team Lead" value={p.teamLead} />
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-600">Progress</p>
              <p className="text-[13px] font-bold text-white">{p.progress}%</p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`} style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Two-column lower section */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Tasks overview */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-white">Tasks overview</p>
              <a href={`/projects/${p.id}/tasks`} className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[12px] font-semibold text-blue-300 hover:bg-blue-500/20 transition-all">
                View all tasks →
              </a>
            </div>

            {/* Count pills */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              {[
                { label: "Completed",        value: p.taskCounts.completed,       cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
                { label: "Active", value: p.taskCounts.active,  cls: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
                { label: "Pending",       value: p.taskCounts.pending,        cls: "bg-slate-700/30 text-slate-400 border-slate-600/20" },
              ].map((c) => (
                <div key={c.label} className={`rounded-xl border px-3 py-3 text-center ${c.cls}`}>
                  <p className="text-xl font-bold">{c.value}</p>
                  <p className="mt-0.5 text-[11px] opacity-75">{c.label}</p>
                </div>
              ))}
            </div>

            {/* Task list */}
            <div className="divide-y divide-white/[0.04]">
              {tasks.map((t) => {
                const ts = TASK_STATUS_CONFIG[t.status];
                return (
                  <div key={t.id} className="flex items-center gap-3 py-2.5">
                    <div className={`h-2 w-2 shrink-0 rounded-full ${ts.dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-white">{t.name}</p>
                      <p className="text-[11px] text-slate-500">{t.assignee}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ts.cls}`}>{ts.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team members */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-white">Team members</p>
              <span className="text-[12px] text-blue-400">{p.members.length} members</span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {p.members.map((m) => (
                <div key={m.name} className="flex items-center gap-3 py-2.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white ${m.color}`}>
                    {m.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-white">{m.name}</p>
                    <p className="text-[11px] text-slate-500">{m.role}</p>
                  </div>
                  {m.name === p.teamLead && (
                    <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">Lead</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}