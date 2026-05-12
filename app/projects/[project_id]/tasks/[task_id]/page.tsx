// TaskDetail.tsx — /projects/[project_id]/tasks/[task_id]
// Team members can update status; Team Lead / Admin can edit everything
import postgres from "postgres";
import { auth } from "@/auth";
import { overwrite } from "zod";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

type TaskStatus = "pending" | "active" | "completed" | "overdue";
type UserRole   = "team_lead" | "team_member" | "admin" | "on_bench";

interface ActivityEntry {
  icon: string;
  text: string;
  highlight: string;
  time: string;
}

interface TaskDetail {
  id: string;
  name: string;
  desc: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  createdAt: string;
  assignedDate: string;
  deadline: string;
  daysRemaining: number;
  isOverdue: boolean;
  project: string;
  projectId: string;
  team: string;
  assignee: string;
  assigneeInitial: string;
  assigneeColor: string;
  assigneeRole: string;
  activity: ActivityEntry[];
}


const STATUS_STEPS: { value: TaskStatus; label: string; icon: string }[] = [
  { value: "pending",        label: "To Do",       icon: "○" },
  { value: "active", label: "In Progress", icon: "◑" },
  { value: "completed",        label: "Done",        icon: "●" },
  { value: "overdue",        label: "Done",        icon: "⚠" },
];

const PRIORITY_CONFIG = {
  low:    { label: "Low",    cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  medium: { label: "Medium", cls: "bg-amber-500/15 text-amber-300 border-amber-500/25" },
  high:   { label: "High",   cls: "bg-red-500/15 text-red-300 border-red-500/25" },
};


// ─── Sidebar ──────────────────────────────────────────────────────────────────

function StatusUpdater({
  current,
  onChange,
  canUpdate,
}: {
  current: TaskStatus;
  onChange: (s: TaskStatus) => void;
  canUpdate: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
      <p className="mb-1 text-[13px] font-semibold text-white">Update status</p>
      <p className="mb-4 text-[12px] text-slate-500">
        {canUpdate ? "Select the current status of this task." : "Only the assigned member can update status."}
      </p>

      <div className="flex flex-col gap-2">
        {STATUS_STEPS.map((s) => {
          const isActive = current === s.value;
          return (
            <button
              key={s.value}
              disabled={!canUpdate}
              // onClick={() => canUpdate && onChange(s.value)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-[13px] font-medium transition-all ${
                isActive
                  ? "border-blue-500/50 bg-blue-500/15 text-blue-300"
                  : "border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-white/[0.12] hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  isActive ? "border-blue-400 bg-blue-500 text-white" : "border-slate-600"
                }`}
              >
                {isActive && "✓"}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>

      {canUpdate && (
        <button className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-[13px] font-semibold text-white hover:from-blue-500 hover:to-blue-600 transition-all">
          Save status
        </button>
      )}
    </div>
  );
}

function MetaSidebar({ task }: { task: TaskDetail }) {
  const p = PRIORITY_CONFIG[task.priority];
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
      <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-slate-500">Task details</p>

      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-widest text-slate-600">Project</p>
          <a href={`/projects/${task.projectId}`} className="text-[13px] font-medium text-blue-400 hover:text-blue-300">
            {task.project} →
          </a>
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-widest text-slate-600">Team</p>
          <p className="text-[13px] font-medium text-slate-300">{task.team}</p>
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-widest text-slate-600">Priority</p>
          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${p.cls}`}>{p.label}</span>
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-widest text-slate-600">Days remaining</p>
          <p className={`text-[13px] font-bold ${task.isOverdue ? "text-red-400" : "text-amber-300"}`}>
            {task.isOverdue ? "Overdue" : `${task.daysRemaining} days`}
          </p>
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-widest text-slate-600">Created</p>
          <p className="text-[13px] text-slate-300">{task.createdAt}</p>
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-widest text-slate-600">Assigned</p>
          <p className="text-[13px] text-slate-300">{task.assignedDate}</p>
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase tracking-widest text-slate-600">Deadline</p>
          <p className="text-[13px] font-semibold text-amber-300">{task.deadline}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default async function TaskDetail({
  params
} : {
  params: Promise<{task_id: string}>
}) {
  const { task_id } = await params;

  const session = await auth();
  const user = session?.user;

  if(!user) return null;
  // current user role
  const currentRole: UserRole = user.role;

  // task
  const [taskRow] = await sql`
    SELECT *
    FROM tasks
    WHERE id = ${task_id}
    LIMIT 1
  `;

  if (!taskRow) {
    throw new Error("Task not found");
  }

  // project
  const [projectRow] = await sql`
    SELECT *
    FROM projects
    WHERE id = ${taskRow.project_id}
    LIMIT 1
  `;

  // assignee
  const [assigneeRow] = await sql`
    SELECT *
    FROM employees
    WHERE id = ${taskRow.assigned_emp_id}
    LIMIT 1
  `;

  const assigneeName =
    assigneeRow?.name || "Unassigned";

  const avatarColors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-cyan-500",
    "bg-amber-500",
    "bg-pink-500",
  ];

  const assigneeColor =
    avatarColors[
      assigneeName.length % avatarColors.length
    ];

  const deadlineDate = new Date(taskRow.deadline);

  const now = new Date();

  const diffTime = deadlineDate.getTime() - now.getTime();

  const daysRemaining = Math.ceil(
    diffTime / (1000 * 60 * 60 * 24)
  );

  const isOverdue =
    taskRow.status !== "completed" &&
    deadlineDate < now;

  let status =
    taskRow.status as TaskStatus;

  if (isOverdue) {
    status = "overdue";
  }

  // activity logs
  const activity: ActivityEntry[] =
    (taskRow.activity_logs || []).map(
      (log: string) => ({
        icon: "📝",
        text: log,
        highlight: assigneeName,
        time: "Recently",
      })
    );

  const task: TaskDetail = {
    id: taskRow.id,
    name: taskRow.name,
    desc: taskRow.description,
    status,
    priority: (taskRow.priority as | "low" | "medium" | "high") || "medium",
    createdAt: taskRow.date_of_creation?.toLocaleDateString() || "",
    assignedDate: taskRow.date_of_assigning?.toLocaleDateString() || "",
    deadline: taskRow.deadline?.toLocaleDateString() || "",
    daysRemaining,
    isOverdue,
    project: projectRow?.name || "Unknown Project",
    projectId: projectRow?.id || "",
    team: projectRow?.team_name || "Unknown Team",
    assignee: assigneeName,
    assigneeInitial: assigneeName
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase(),

    assigneeColor,
    assigneeRole: assigneeRow?.role || "Employee",
    activity,
  };

  // In real app: check if sessionStorage id === task.assigneeId
  const isAssignee = true;
  const canEdit    = currentRole === "team_lead" || currentRole === "admin";
  const canUpdate  = isAssignee || canEdit;

  

  const currentStatusCfg = {
    pending:        { label: "Pending",       pill: "bg-slate-700/60 text-slate-400 border-slate-600/30" },
    active: { label: "Active", pill: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    completed:        { label: "Completed",        pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    overdue:        { label: "Overdue",        pill: "bg-red-500/20 text-red-300 border-red-500/30" },
  }[task.status];

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">

      <main className="mx-auto max-w-5xl px-7 py-10">
        {/* Breadcrumb */}
        <div className="mb-5 flex flex-wrap items-center gap-1.5 text-[12px] text-slate-500">
          <a href="/projects"             className="text-blue-400 hover:text-blue-300">Projects</a><span>›</span>
          <a href={`/projects/${task.projectId}`} className="text-blue-400 hover:text-blue-300">{task.project}</a><span>›</span>
          <a href={`/projects/${task.projectId}/tasks`} className="text-blue-400 hover:text-blue-300">Tasks</a><span>›</span>
          <span className="text-slate-400">{task.name}</span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-5">

            {/* Main card */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
              {/* Title row */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-[20px] font-bold text-white">{task.name}</h1>
                    <span className={`rounded-full border px-3 py-0.5 text-[11px] font-semibold ${currentStatusCfg.pill}`}>
                      {currentStatusCfg.label}
                    </span>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex shrink-0 gap-2">
                    <button className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-slate-400 hover:bg-white/[0.08] hover:text-white transition-all">
                      ✏️ Edit
                    </button>
                    <button className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[12px] font-medium text-red-400 hover:bg-red-500/20 transition-all">
                      🗑 Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Dates row */}
              <div className="mb-5 grid grid-cols-3 gap-4">
                {[
                  { label: "CREATED",       value: task.createdAt,    cls: "text-slate-300" },
                  { label: "ASSIGNED DATE", value: task.assignedDate, cls: "text-slate-300" },
                  { label: "DEADLINE",      value: task.deadline,     cls: "text-amber-300" },
                ].map((d) => (
                  <div key={d.label}>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-600">{d.label}</p>
                    <p className={`text-[13px] font-semibold ${d.cls}`}>{d.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mb-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-600">Description</p>
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-[13px] leading-7 text-slate-400">
                  {task.desc}
                </div>
              </div>

              {/* Divider */}
              <div className="mb-5 h-px bg-white/[0.05]" />

              {/* Assignee */}
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600">Assigned to</p>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white ${task.assigneeColor}`}>
                    {task.assigneeInitial}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-white">{task.assignee}</p>
                    <p className="text-[12px] text-slate-500">{task.assigneeRole} · {task.team}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">Active</span>
                </div>
              </div>
            </div>

            {/* Activity log */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <p className="mb-4 text-[13px] font-semibold text-white">Activity log</p>
              <div className="flex flex-col">
                {task.activity.map((a, i) => (
                  <div key={i} className={`flex gap-3 pb-4 ${i < task.activity.length - 1 ? "border-b border-white/[0.04] mb-4" : ""}`}>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[12px]">
                      {a.icon}
                    </div>
                    <div>
                      <p className="text-[13px] text-slate-400">
                        <span className="font-semibold text-white">{a.highlight}</span> {a.text}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="flex flex-col gap-4">
            {/* will add this feature soon */}
            {/* <StatusUpdater current={task.status} onChange={() => {}} canUpdate={canUpdate} /> */}
            <MetaSidebar task={task} />
          </div>
        </div>
      </main>
    </div>
  );
}