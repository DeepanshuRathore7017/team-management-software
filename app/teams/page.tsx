// Teams.tsx — /teams (Admin only)
import postgres from "postgres";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

type ProjectStatus = "active" | "overdue" | "pending" | "completed" | "none";

interface TeamMember {
  initial: string;
  color: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  lead: string;
  leadInitial: string;
  leadColor: string;
  members: TeamMember[];
  totalMembers: number;
  project: string;
  projectId: string;
  projectStatus: ProjectStatus;
  tasksOpen: number;
  tasksDone: number;
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

// const MOCK_TEAMS: Team[] = [
//   {
//     id: "team-alpha",
//     name: "Team Alpha",
//     lead: "Rahul Verma",
//     leadInitial: "R",
//     leadColor: "bg-violet-500",
//     members: [
//       { initial: "S", color: "bg-cyan-500",    name: "Sneha Kulkarni" },
//       { initial: "V", color: "bg-emerald-500", name: "Vikram Das" },
//       { initial: "K", color: "bg-amber-500",   name: "Kavya Menon" },
//       { initial: "A", color: "bg-rose-500",    name: "Arjun Patel" },
//       { initial: "N", color: "bg-blue-500",    name: "Nisha Reddy" },
//       { initial: "P", color: "bg-teal-500",    name: "Pranav Shah" },
//       { initial: "J", color: "bg-pink-500",    name: "Jaya Iyer" },
//     ],
//     totalMembers: 8,
//     project: "Ethara Platform v2",
//     projectId: "1",
//     projectStatus: "active",
//     createdAt: "Jan 5, 2025",
//     tasksOpen: 6,
//     tasksDone: 9,
//   },
//   {
//     id: "team-beta",
//     name: "Team Beta",
//     lead: "Meera Joshi",
//     leadInitial: "M",
//     leadColor: "bg-amber-500",
//     members: [
//       { initial: "N", color: "bg-pink-500",    name: "Nikhil Sharma" },
//       { initial: "V", color: "bg-blue-500",    name: "Vani Pillai" },
//       { initial: "D", color: "bg-teal-500",    name: "Dev Anand" },
//       { initial: "R", color: "bg-rose-500",    name: "Riya Kapoor" },
//     ],
//     totalMembers: 5,
//     project: "Mobile App Redesign",
//     projectId: "2",
//     projectStatus: "active",
//     createdAt: "Feb 1, 2025",
//     tasksOpen: 8,
//     tasksDone: 5,
//   },
//   {
//     id: "team-gamma",
//     name: "Team Gamma",
//     lead: "Priya Nair",
//     leadInitial: "P",
//     leadColor: "bg-cyan-500",
//     members: [
//       { initial: "J", color: "bg-violet-500",  name: "Jay Mehta" },
//       { initial: "A", color: "bg-rose-500",    name: "Aisha Khan" },
//       { initial: "S", color: "bg-emerald-500", name: "Siddharth Rao" },
//       { initial: "T", color: "bg-amber-500",   name: "Tanvi Desai" },
//       { initial: "L", color: "bg-blue-500",    name: "Liam D'Souza" },
//     ],
//     totalMembers: 6,
//     project: "Analytics Dashboard",
//     projectId: "3",
//     projectStatus: "overdue",
//     createdAt: "Nov 10, 2024",
//     tasksOpen: 3,
//     tasksDone: 14,
//   },
//   {
//     id: "team-delta",
//     name: "Team Delta",
//     lead: "Karan Mehta",
//     leadInitial: "K",
//     leadColor: "bg-teal-500",
//     members: [
//       { initial: "R", color: "bg-blue-500",    name: "Rohit Gupta" },
//       { initial: "S", color: "bg-pink-500",    name: "Swati Bose" },
//     ],
//     totalMembers: 3,
//     project: "Internal HR Portal",
//     projectId: "5",
//     projectStatus: "completed",
//     createdAt: "Sep 1, 2024",
//     tasksOpen: 0,
//     tasksDone: 22,
//   },
//   {
//     id: "team-epsilon",
//     name: "Team Epsilon",
//     lead: "Aryan Kapoor",
//     leadInitial: "A",
//     leadColor: "bg-rose-500",
//     members: [
//       { initial: "G", color: "bg-violet-500",  name: "Gaurav Singh" },
//       { initial: "H", color: "bg-teal-500",    name: "Harini Nair" },
//       { initial: "I", color: "bg-cyan-500",    name: "Ishaan Jain" },
//     ],
//     totalMembers: 4,
//     project: "None",
//     projectId: "",
//     projectStatus: "none",
//     createdAt: "Apr 20, 2025",
//     tasksOpen: 0,
//     tasksDone: 0,
//   },
// ];

const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; pill: string }> = {
  active:    { label: "Active",    pill: "bg-emerald-500/20 text-emerald-300" },
  overdue:   { label: "Overdue",   pill: "bg-red-500/20 text-red-300" },
  pending:   { label: "Pending",   pill: "bg-slate-700/60 text-slate-400" },
  completed: { label: "Completed", pill: "bg-violet-500/20 text-violet-300" },
  none:      { label: "Unassigned",pill: "bg-amber-500/15 text-amber-400" },
};


// ─── Team Card ────────────────────────────────────────────────────────────────

function TeamCard({ team }: { team: Team }) {
  const pCfg = PROJECT_STATUS_CONFIG[team.projectStatus];
  const visibleMembers = team.members.slice(0, 5);
  const extra = team.totalMembers - 1 - visibleMembers.length; // exclude lead

  return (
    <div className="group flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-white/[0.05]">

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <a href={`/teams/${team.id}`} className="block text-[16px] font-bold text-white hover:text-blue-300 transition-colors">
            {team.name}
          </a>
          {/* <p className="mt-0.5 text-[12px] text-slate-500">Created {team.createdAt}</p> */}
        </div>
      </div>

      {/* Team Lead */}
      <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ${team.leadColor}`}>
          {team.leadInitial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-white">{team.lead}</p>
          <p className="text-[11px] text-slate-500">Team Lead</p>
        </div>
        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-300">LEAD</span>
      </div>

      {/* Members avatars */}
      <div className="mb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
          Members · {team.totalMembers}
        </p>
        <div className="flex items-center">
          {visibleMembers.map((m, i) => (
            <div
              key={i}
              title={m.name}
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0b0f1a] text-[10px] font-bold text-white ${m.color}`}
              style={{ marginLeft: i === 0 ? 0 : -8 }}
            >
              {m.initial}
            </div>
          ))}
          {extra > 0 && (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0b0f1a] bg-white/[0.08] text-[10px] font-semibold text-slate-400"
              style={{ marginLeft: -8 }}
            >
              +{extra}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-white/[0.05]" />

      {/* Project */}
      <div className="mb-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-600">Assigned project</p>
        <div className="flex items-center justify-between gap-2">
          {team.projectId ? (
            <a href={`/projects/${team.projectId}`} className="truncate text-[13px] font-medium text-blue-400 hover:text-blue-300">
              {team.project}
            </a>
          ) : (
            <span className="text-[13px] text-slate-600">No project assigned</span>
          )}
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pCfg.pill}`}>{pCfg.label}</span>
        </div>
      </div>

      {/* Task stats */}
      <div className="mt-auto grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-blue-500/15 bg-blue-500/[0.07] px-3 py-2 text-center">
          <p className="text-[18px] font-bold text-blue-300">{team.tasksOpen}</p>
          <p className="text-[11px] text-slate-500">Open tasks</p>
        </div>
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.07] px-3 py-2 text-center">
          <p className="text-[18px] font-bold text-emerald-300">{team.tasksDone}</p>
          <p className="text-[11px] text-slate-500">Completed</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default async function Teams() {
  // const totalMembers = MOCK_TEAMS.reduce((s, t) => s + t.totalMembers, 0);
  // const assignedTeams = MOCK_TEAMS.filter((t) => t.projectStatus !== "none").length;


  const teams_rows = await sql `SELECT * FROM teams`;
  const total_employees = await sql `SELECT COUNT(id) FROM employees WHERE team_id IS NOT NULL`;
  const totalEmployees = total_employees[0].count;

  const assigned_teams = await sql`SELECT COUNT(DISTINCT team_id) FROM projects WHERE team_id IS NOT NULL`;
  const assignedTeams = assigned_teams[0].count;

  const teams: Team[] = [];
  for(const team of teams_rows) {
    // fetch team members
    const memberRows = await sql`
      SELECT name FROM employees
      WHERE team_id = ${team.id}
    `;

    // transform members
    const members: TeamMember[] = memberRows.map(
      (member, index) => ({
        name: member.name,

        initial: member.name
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .toUpperCase(),

        color: avatarColors[index % avatarColors.length],
      })
    );

    // fetch team lead
    const leadRow = await sql`
      SELECT name
      FROM employees
      WHERE team_id = ${team.id}
      AND role = 'team_lead'
      LIMIT 1
    `;

    // fetch project
    const projectRow = await sql`
      SELECT id, name, status, date_of_creation
      FROM projects
      WHERE team_id = ${team.id}
      LIMIT 1
    `;

    const leadName = leadRow[0]?.name || "No Lead";

    teams.push({
      id: team.id,
      name: team.name,

      lead: leadName,

      leadInitial: leadName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase(),

      leadColor: "bg-blue-500",

      members,

      totalMembers: members.length,

      project: projectRow[0]?.name || "No Project",

      projectId: projectRow[0]?.id || "",

      projectStatus:
        (projectRow[0]?.status as ProjectStatus) || "pending",

      tasksOpen: Number(team.open_tasks),

      tasksDone: Number(team.completed_tasks),
    });


  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">

      <main className="mx-auto max-w-5xl px-7 py-10">
        {/* Header */}
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-white">Teams</h1>
            <p className="mt-1 text-[13px] text-slate-500">
              {teams.length} teams · {totalEmployees} employees · {assignedTeams} assigned to projects
            </p>
          </div>
          <a href='/teams/new' className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-blue-900/30 hover:from-blue-500 hover:to-blue-600 transition-all">
            ＋ New Team
          </a>
        </div>

        {/* Summary stats */}
        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Teams",    value: teams.length,  icon: "👥", accent: "bg-violet-500/20 text-violet-300" },
            { label: "Total Members",  value: totalEmployees,        icon: "🧑‍💼", accent: "bg-blue-500/20 text-blue-300" },
            { label: "With Projects",  value: assignedTeams,       icon: "📁", accent: "bg-cyan-500/20 text-cyan-300" },
            { label: "Unassigned",     value: teams.length - assignedTeams, icon: "⏸️", accent: "bg-amber-500/20 text-amber-300" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.05]">
              <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl text-base ${s.accent}`}>{s.icon}</div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="mt-0.5 text-[12px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search  will be implemented soon*/}
        {/* <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5">
          <span className="text-slate-500">🔍</span>
          <input
            className="flex-1 bg-transparent text-[13px] text-white placeholder-slate-600 outline-none"
            placeholder="Search teams by name or lead…"
          />
        </div> */}

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      </main>
    </div>
  );
}