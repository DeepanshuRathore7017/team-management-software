// Projects.tsx — /projects (Admin only)
import postgres from "postgres";
import { auth } from "@/auth";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

type ProjectStatus = "active" | "overdue" | "pending" | "completed";

interface Project {
  id: string;
  name: string;
  desc: string;
  team: string;
  teamLead: string;
  createdAt: string;
  assignedAt: string;
  deadline: string;
  progress: number;
  status: ProjectStatus;
  members: { initial: string; color: string }[];
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

const STATUS_CONFIG: Record<ProjectStatus, { label: string; pill: string; bar: string }> = {
  active:    { label: "Active",    pill: "bg-emerald-500/20 text-emerald-300", bar: "from-blue-500 to-blue-400" },
  overdue:   { label: "Overdue",   pill: "bg-red-500/20 text-red-300",         bar: "from-red-500 to-red-400" },
  pending:   { label: "Pending",   pill: "bg-slate-700/60 text-slate-400",     bar: "from-slate-600 to-slate-500" },
  completed: { label: "Completed", pill: "bg-violet-500/20 text-violet-300",   bar: "from-emerald-500 to-emerald-400" },
};

const FILTERS: { label: string; value: ProjectStatus | "all" }[] = [
  { label: "All",       value: "all" },
  { label: "Active",    value: "active" },
  { label: "Overdue",   value: "overdue" },
  { label: "Pending",   value: "pending" },
  { label: "Completed", value: "completed" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const cfg = STATUS_CONFIG[project.status];
  const extraMembers = project.members.length > 4 ? project.members.length - 4 : 0;
  const visibleMembers = project.members.slice(0, 4);

  return (
    <div className={`group flex flex-col rounded-2xl border bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.05] ${
      project.status === "overdue" ? "border-red-500/20 hover:border-red-500/40" : "border-white/[0.07] hover:border-blue-500/35"
    }`}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <a href={`/projects/${project.id}`} className="block truncate text-[15px] font-semibold text-white hover:text-blue-300 transition-colors">
            {project.name}
          </a>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{project.desc}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.pill}`}>{cfg.label}</span>
      </div>

      {/* Meta */}
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-500">
        <span>📅 Created {project.createdAt}</span>
        <span>📌 Assigned {project.assignedAt}</span>
        <span>🎯 Due {project.deadline}</span>
        {project.team && <span>👥 {project.team}</span>}
        {!project.team && <span className="text-amber-400/70">⚠️ Unassigned</span>}
      </div>

      {/* Progress */}
      <div className="mt-auto">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} transition-all`} style={{ width: `${project.progress}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-slate-600">
          <span>{project.progress}% complete</span>
          {project.status === "overdue" && <span className="text-red-400">Overdue</span>}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-4">
        {/* Team avatars */}
        <div className="flex">
          {visibleMembers.map((m, i) => (
            <div
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0b0f1a] text-[10px] font-bold text-white ${m.color}`}
              style={{ marginLeft: i === 0 ? 0 : -6 }}
            >
              {m.initial}
            </div>
          ))}
          {extraMembers > 0 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#0b0f1a] bg-white/[0.08] text-[10px] text-slate-400" style={{ marginLeft: -6 }}>
              +{extraMembers}
            </div>
          )}
          {project.members.length === 0 && <span className="text-[12px] text-slate-600">No members yet</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-400 hover:bg-white/[0.1] hover:text-white">Assign</button>
          <button className="rounded-lg bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-400 hover:bg-white/[0.1] hover:text-white">Edit</button>
          <button className="rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400 hover:bg-red-500/20">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default async function Projects() {
  // In real app use useState for activeFilter + search
  const session = await auth();
  if(!session?.user){
    return null;
  }
  const user = session?.user;

  const projectRows = await sql`
    SELECT *
    FROM projects
  `;

  const projects: Project[] = [];

  for (const prj of projectRows) {
    // fetch team lead
    const leadRow = await sql`
      SELECT name
      FROM employees
      WHERE team_id = ${prj.team_id}
      AND role = 'team_lead'
      LIMIT 1
    `;

    // fetch team members
    const memberRows = await sql`
      SELECT name
      FROM employees
      WHERE team_id = ${prj.team_id}
    `;

    const members = memberRows.map((member, index) => ({
      initial: member.name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase(),

      color: avatarColors[index % avatarColors.length],
    }));

    let status = prj.status as ProjectStatus;

    // overdue logic
    if (
      status !== "completed" &&
      new Date(prj.deadline) < new Date()
    ) {
      status = "overdue";
    }

    projects.push({
      id: prj.id,
      name: prj.name,
      desc: prj.description,
      team: prj.team_name,
      teamLead: leadRow[0]?.name || "No Lead",
      createdAt: prj.date_of_creation?.toLocaleDateString() || "",
      assignedAt: prj.date_of_assigning?.toLocaleDateString() || "",
      deadline: prj.deadline?.toLocaleDateString() || "",
      progress: prj.progress,
      status,
      members,
    });
  }

  const counts = FILTERS.map((f) => ({
    ...f,
    count: f.value === "all" ? projects.length : projects.filter((p) => p.status === f.value).length,
  }));

  const activeFilter: ProjectStatus | "all" = "all";
  const filtered = activeFilter === "all" ? projects : projects.filter((p) => p.status === activeFilter);

  

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <main className="mx-auto max-w-5xl px-7 py-10">
        {/* Page header */}
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-white">Projects</h1>
            <p className="mt-1 text-[13px] text-slate-500">Manage and track all projects across teams</p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-blue-900/30 hover:from-blue-500 hover:to-blue-600 transition-all">
            ＋ New Project
          </button>
        </div>

        {/* Search will be impolemented soon*/}
        {/* <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5">
          <span className="text-slate-500">🔍</span>
          <input
            className="flex-1 bg-transparent text-[13px] text-white placeholder-slate-600 outline-none"
            placeholder="Search projects by name, team or status…"
          />
        </div> */}

        {/* Filters will be implemented soon */}
        {/* <div className="mb-6 flex flex-wrap gap-2">
          {counts.map((f) => (
            <button
              key={f.value}
              className={`rounded-full border px-3.5 py-1 text-[12px] font-medium transition-all ${
                f.value === activeFilter
                  ? "border-blue-500/50 bg-blue-500/20 text-blue-300"
                  : "border-white/[0.07] bg-white/[0.03] text-slate-400 hover:border-white/[0.14] hover:text-slate-300"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div> */}

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </main>
    </div>
  );
}