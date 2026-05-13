// Accessible by Team Lead (CRUD) and Team Members (view + status update)
import postgres from "postgres";
import { auth } from "@/auth";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });


type TaskStatus = "active" | "pending" | "completed" | "overdue";
type UserRole   = "team_lead" | "team_member" | "admin" | "on_bench";

interface Task {
  id: string;
  name: string;
  desc: string;
  assignee: string;
  assigneeInitial: string;
  assigneeColor: string;
  assignedDate: string;
  deadline: string;
  status: TaskStatus;
  isOverdue: boolean;
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

// const MOCK_TASKS: Task[] = [
//   {
//     id: "t1",
//     name: "Design auth flow",
//     desc: "Figma wireframes and user flow diagrams",
//     assignee: "Sneha Kulkarni",
//     assigneeInitial: "S",
//     assigneeColor: "bg-cyan-500",
//     assignedDate: "Jan 20",
//     deadline: "Feb 10",
//     status: "done",
//     isOverdue: false,
//   },
//   {
//     id: "t2",
//     name: "Build REST API endpoints",
//     desc: "Auth, projects, tasks modules with JWT middleware",
//     assignee: "Vikram Das",
//     assigneeInitial: "V",
//     assigneeColor: "bg-emerald-500",
//     assignedDate: "Feb 12",
//     deadline: "Jun 18",
//     status: "in_progress",
//     isOverdue: false,
//   },
//   {
//     id: "t3",
//     name: "Integrate payment gateway",
//     desc: "Razorpay SDK with webhook handling",
//     assignee: "Ankit Mehta",
//     assigneeInitial: "A",
//     assigneeColor: "bg-violet-500",
//     assignedDate: "Mar 5",
//     deadline: "May 1",
//     status: "in_progress",
//     isOverdue: true,
//   },
//   {
//     id: "t4",
//     name: "Write unit tests",
//     desc: "Jest test coverage for API layer (>80%)",
//     assignee: "Unassigned",
//     assigneeInitial: "?",
//     assigneeColor: "bg-slate-600",
//     assignedDate: "—",
//     deadline: "Jun 25",
//     status: "todo",
//     isOverdue: false,
//   },
//   {
//     id: "t5",
//     name: "Set up CI/CD pipeline",
//     desc: "GitHub Actions with Docker deployment",
//     assignee: "Kavya Menon",
//     assigneeInitial: "K",
//     assigneeColor: "bg-amber-500",
//     assignedDate: "Apr 1",
//     deadline: "Jun 10",
//     status: "done",
//     isOverdue: false,
//   },
//   {
//     id: "t6",
//     name: "Dashboard UI components",
//     desc: "React component library with Tailwind",
//     assignee: "Sneha Kulkarni",
//     assigneeInitial: "S",
//     assigneeColor: "bg-cyan-500",
//     assignedDate: "Apr 15",
//     deadline: "Jun 20",
//     status: "in_progress",
//     isOverdue: false,
//   },
//   {
//     id: "t7",
//     name: "Database schema design",
//     desc: "ERD and migration scripts for PostgreSQL",
//     assignee: "Pranav Shah",
//     assigneeInitial: "P",
//     assigneeColor: "bg-teal-500",
//     assignedDate: "Jan 12",
//     deadline: "Jan 28",
//     status: "done",
//     isOverdue: false,
//   },
// ];

const STATUS_CONFIG: Record<TaskStatus, { label: string; pill: string; dot: string }> = {
  completed:        { label: "Completed",        pill: "bg-emerald-500/20 text-emerald-300", dot: "bg-emerald-400" },
  active: { label: "Active", pill: "bg-blue-500/20 text-blue-300",       dot: "bg-blue-400" },
  pending:        { label: "Pending",       pill: "bg-slate-700/60 text-slate-400",     dot: "bg-slate-500" },
  overdue:        { label: "Overdue",       pill: "bg-red-700/60 text-slate-400",     dot: "bg-red-500" },
};

// const FILTERS: { label: string; value: TaskStatus | "all" | "overdue" }[] = [
//   { label: "All",         value: "all" },
//   { label: "To Do",       value: "todo" },
//   { label: "In Progress", value: "in_progress" },
//   { label: "Done",        value: "done" },
//   { label: "⚠ Overdue",  value: "overdue" },
// ];


// ─── Task table row ───────────────────────────────────────────────────────────

function TaskRow({ task, canEdit, project_id }: { task: Task; canEdit: boolean, project_id: string }) {
  const s = STATUS_CONFIG[task.status];
  return (
    <tr className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
      {/* Task name */}
      <td className="px-5 py-3.5">
        <a href={`/projects/${project_id}/tasks/${task.id}`} className="block">
          <p className="text-[13px] font-medium text-white hover:text-blue-300 transition-colors">{task.name}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">{task.desc}</p>
        </a>
      </td>

      {/* Assignee */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${task.assigneeColor}`}>
            {task.assigneeInitial}
          </div>
          <span className="text-[12px] text-slate-400">
            {task.assignee === "Unassigned" ? <span className="text-slate-600">Unassigned</span> : task.assignee}
          </span>
        </div>
      </td>

      {/* Assigned date */}
      <td className="px-5 py-3.5 text-[12px] text-slate-500">{task.assignedDate}</td>

      {/* Deadline */}
      <td className="px-5 py-3.5">
        <span className={`text-[12px] ${task.isOverdue ? "font-semibold text-red-400" : "text-slate-500"}`}>
          {task.deadline} {task.isOverdue && "⚠"}
        </span>
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.pill}`}>{s.label}</span>
      </td>

      {/* Actions — team_lead / admin only */}
      {canEdit && (
        <td className="px-5 py-3.5">
          <div className="flex gap-1">
            <button className="rounded-lg bg-white/[0.05] px-2 py-1 text-[11px] text-slate-400 hover:bg-white/[0.1] hover:text-white">✏️</button>
            <button className="rounded-lg bg-red-500/10 px-2 py-1 text-[11px] text-red-400 hover:bg-red-500/20">🗑</button>
          </div>
        </td>
      )}
    </tr>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default async function Tasks({
  params
} : {
  params: Promise<{project_id: string}>
}) {
  const session = await auth();
  const user = session?.user;

  const {project_id} = await params;
  const tasks_rows = await sql`SELECT * FROM tasks WHERE project_id = ${project_id}`;
  const [{name: projectName}] = await sql `SELECT name FROM projects WHERE id = ${project_id}`

  const tasks: Task[] = [];
  for(const [index, task] of tasks_rows.entries()) {
    const isOverdue = task.deadline && task.status != 'completed' && task.deadline < new Date();
    const status = isOverdue ? 'overdue' : task.status;
    const [{name: assigneeName}] = await sql`SELECT name FROM employees WHERE id = ${task.assigned_emp_id}`
    tasks.push({
      id: task.id,
      name: task.name,
      desc: task.description,
      assignee: task.assigned_emp_email || 'Unassigned',
      assigneeInitial: assigneeName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase(),
      assigneeColor: avatarColors[index % avatarColors.length],
      assignedDate: task.date_of_creation?.toLocaleDateString(),
      deadline: task.deadline?.toLocaleDateString() || null,
      status: status,
      isOverdue: isOverdue,

    })
  }

  if (!user?.role) {
    throw new Error("User role not found");
  }

  const currentRole: UserRole = user?.role; // replace with sessionStorage role
  const canEdit = currentRole === "team_lead" || currentRole === "admin";
  const activeFilter: TaskStatus | "all" | "overdue" = "all";

  const overdueCnt = tasks.filter((t) => t.isOverdue).length;
  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "active").length,
    done: tasks.filter((t) => t.status === "completed").length,
    overdue: overdueCnt,
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">

      <main className="mx-auto max-w-5xl px-7 py-10">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-1.5 text-[12px] text-slate-500">
          <a href="/projects" className="text-blue-400 hover:text-blue-300">Projects</a>
          <span>›</span>
          <a href={`/projects/${project_id}`} className="text-blue-400 hover:text-blue-300">{projectName}</a>
          <span>›</span>
          <span className="text-slate-400">Tasks</span>
        </div>

        {/* Page header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-white">Tasks</h1>
            <p className="mt-1 text-[13px] text-slate-500">
              {projectName} · {tasks.length} tasks total
              {overdueCnt > 0 && <span className="ml-2 text-red-400">· {overdueCnt} overdue</span>}
            </p>
          </div>
          {canEdit && (
            <a href={`/projects/${project_id}/tasks/new`} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-blue-900/30 hover:from-blue-500 hover:to-blue-600 transition-all">
              ＋ New Task
            </a>
          )}
        </div>

        {/* Stat bar */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            { label: "Completed",        value: counts.done,        cls: "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300" },
            { label: "Active", value: counts.in_progress, cls: "border-blue-500/20 bg-blue-500/[0.07] text-blue-300" },
            { label: "Pending",       value: counts.todo,        cls: "border-slate-600/20 bg-slate-700/20 text-slate-400" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border px-4 py-3 text-center ${s.cls}`}>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="mt-0.5 text-[11px] opacity-70">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        {/* <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`rounded-full border px-3.5 py-1 text-[12px] font-medium transition-all ${
                f.value === "overdue"
                  ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : f.value === activeFilter
                  ? "border-blue-500/50 bg-blue-500/20 text-blue-300"
                  : "border-white/[0.07] bg-white/[0.03] text-slate-400 hover:border-white/[0.14] hover:text-slate-300"
              }`}
            >
              {f.label} ({counts[f.value as keyof typeof counts]})
            </button>
          ))}
        </div> */}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Task</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Assigned to</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Assigned</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Deadline</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Status</th>
                {canEdit && <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <TaskRow key={t.id} task={t} canEdit={canEdit} project_id={project_id} />  
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}