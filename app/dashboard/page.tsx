// Dashboard.tsx
// Role-based dashboard — swap `role` inside mockUser to preview different views

import Link from "next/link";
import { auth } from "@/auth";
import postgres from "postgres";
import { tasks } from "@/lib/placeholder-data";
import ErrorAlert from "@/components/ErrorAlert";

type Role = "admin" | "team_lead" | "team_member" | "on_bench";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });


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

type TaskStatus = "pending" | "active" | "completed" | "overdue";

function TaskRow({ title, project, deadline, status }: { title: string; project: string; deadline: string; status: TaskStatus }) {
  const s: Record<TaskStatus, { label: string; cls: string }> = {
    pending:        { label: "Pending",       cls: "bg-slate-700/60 text-slate-400" },
    active: { label: "Active", cls: "bg-yellow-500/20 text-ye-300llow" },
    completed:        { label: "Completed",        cls: "bg-emerald-500/20 text-emerald-300" },
    overdue:        { label: "Overdue",        cls: "bg-red-500/20 text-red-300" },
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

async function AdminWidgets() {
  const total_projects = await sql`SELECT COUNT(id) FROM projects`;
  const totalProjects = total_projects[0].count;
  const recentProjects = await sql`SELECT * FROM projects ORDER BY date_of_creation DESC LIMIT 5;`

  const total_teams = await sql`SELECT COUNT(id) FROM teams`;
  const totalTeams = total_teams[0].count;

  const total_employees = await sql`SELECT COUNT(id) FROM employees`;
  const totalEmployees = total_employees[0].count;

  const on_bench_employees = await sql`SELECT COUNT(id) FROM employees WHERE role = 'on_bench'`;
  const onBenchEmployees = on_bench_employees[0].count;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Projects" value={totalProjects} icon="📁" accent="bg-violet-500/20 text-violet-300" />
        <StatCard label="Active Teams"   value={totalTeams}  icon="👥" accent="bg-blue-500/20 text-blue-300" />
        <StatCard label="Employees"      value={totalEmployees} icon="🧑‍💼" accent="bg-cyan-500/20 text-cyan-300" />
        <StatCard label="On Bench"       value={onBenchEmployees}  icon="⏸️" accent="bg-amber-500/20 text-amber-300" />
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
          {recentProjects.map((p) => (
            <div key={p.name} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-white">{p.name}</p>
                <p className="text-[11px] text-slate-500">{p.team_name}</p>
              </div>
              <span className="text-[11px] text-slate-500">Due {new Date(p.deadline).toLocaleDateString() }</span>
              <span 
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold 
                  ${p.status == 'active' ? 'bg-yellow-500/20 text-ye-300llow' : 
                  p.status == 'pending' ? 'bg-slate-700/60 text-slate-400' : 
                  p.status == 'overdue' ? 'bg-red-500/20 text-red-300' : 
                  'bg-emerald-500/20 text-emerald-300'}`
                  }>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

async function TeamLeadWidgets() {
  const session = await auth();
  if(!session?.user){
    return null;
  }
  const user = session?.user;

  const team_rows = await sql`SELECT team_id FROM employees WHERE id = ${user?.id}`;
  const teamId = team_rows[0].team_id;
  const total_members_in_team_rows = await sql`SELECT COUNT(id) FROM employees WHERE team_id = ${teamId}`
  const totalMembersInTeam = total_members_in_team_rows[0].count;

  const open_tasks_rows = await sql`SELECT open_tasks FROM teams WHERE id = ${teamId}`;
  const openTasks = open_tasks_rows[0].open_tasks;

  const project_rows = await sql`SELECT id, name, status, deadline, progress FROM projects WHERE team_id = ${teamId}`;
  const projectId = project_rows[0].id;
  const projectName = project_rows[0].name;
  let projectStatus = project_rows[0].status;
  const projectDeadline = project_rows[0].deadline;
  const projectProgress = project_rows[0].progress;

  const tasks = await sql`SELECT * FROM tasks WHERE project_id = ${projectId}`;
  // console.log("tasks = ", tasks)

  if(projectDeadline < new Date()) {
    projectStatus = 'overdue'
  }

  const overdue_tasks_rows = await sql`SELECT COUNT(id) FROM tasks WHERE project_id = ${projectId} AND deadline < NOW()`;
  const overdueTasks = overdue_tasks_rows[0].count;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Team Size"  value={totalMembersInTeam}  icon="👥" accent="bg-cyan-500/20 text-cyan-300" />
        <StatCard label="Open Tasks" value={openTasks} icon="📋" accent="bg-blue-500/20 text-blue-300" />
        <StatCard label="Overdue"    value={overdueTasks}  icon="⚠️" accent="bg-rose-500/20 text-rose-300" />
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-white">Assigned project</p>
          <span 
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold 
              ${projectStatus == 'active' ? 'bg-yellow-500/20 text-ye-300llow' : 
                projectStatus == 'pending' ? 'bg-slate-700/60 text-slate-400' : 
                projectStatus == 'overdue' ? 'bg-red-500/20 text-red-300' : 
                projectStatus == 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 
                ''}`
              }>
                {projectStatus.charAt(0).toUpperCase() + projectStatus.slice(1)}
          </span>
        </div>
        <p className="mt-2 text-lg font-bold text-blue-300">{projectName}</p>
        <p className="mt-1 text-[12px] text-slate-500">Deadline : {projectDeadline?.toLocaleDateString()}</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400`} style={{ width: `${projectProgress}%` }} />
        </div>
        <p className="mt-1.5 text-right text-[11px] text-slate-500">{projectProgress}%</p>  
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <p className="mb-3 text-[13px] font-semibold text-white">Recent tasks</p>
        <div className="divide-y divide-white/[0.04]">
          {
            tasks.map((tsk) => {
              let taskStatus = tsk.status;
              if (
                taskStatus !== "completed" &&
                new Date(tsk.deadline) < new Date()
              ) {
                taskStatus = "overdue";
              }

             return (
              <TaskRow key={tsk.id} title={tsk.name} project={projectName} deadline={tsk.deadline.toLocaleDateString()} status={taskStatus} />
             ) 
            })
          }
        </div>
      </div>


      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <p className="mb-3 text-[13px] font-semibold text-white">My team</p>
        <div className="divide-y divide-white/[0.04]">
         {/* dynamic team id to be addedd later */}
          <QuickLink label="My Team"  sub=""  icon="👥"  href={`/teams/${teamId}`} /> 
        </div>
      </div>
    </>
  );
}

async function TeamMemberWidgets() {
  const session = await auth();
  if(!session?.user){
    return null;
  }
  const user = session?.user;

  const tasks = await sql`SELECT * FROM tasks WHERE assigned_emp_id = ${user.id}`

  const total_tasks = await sql`SELECT COUNT(id) FROM tasks WHERE assigned_emp_id = ${user.id}`
  const totalTasks = total_tasks[0].count;

  const active_tasks = await sql`SELECT COUNT(id) FROM tasks WHERE status = 'active'`;
  const activeTasks = active_tasks[0].count;

  const overdue_tasks = await sql`SELECT COUNT(id) FROM tasks WHERE deadline < NOW()`;
  const overdueTasks = overdue_tasks[0].count;

  const project = await sql`SELECT * FROM tasks WHERE assigned_emp_id = ${user.id}`
  const projectId = project[0].project_id;
  const projectName = project[0].project_name;

  const team_id = await sql`SELECT team_id FROM employees WHERE id = ${user.id}`
  const teamId = team_id[0].team_id;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="My Tasks"    value={totalTasks} icon="📋" accent="bg-blue-500/20 text-blue-300" />
        <StatCard label="In Progress" value={activeTasks} icon="🔄" accent="bg-cyan-500/20 text-cyan-300" />
        <StatCard label="Overdue"     value={overdueTasks} icon="⚠️" accent="bg-rose-500/20 text-rose-300" />
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <p className="mb-3 text-[13px] font-semibold text-white">My tasks</p>
        <div className="divide-y divide-white/[0.04]">
          {
            tasks.map((tsk) => {
              let taskStatus = tsk.status;
              if (
                taskStatus !== "completed" &&
                new Date(tsk.deadline) < new Date()
              ) {
                taskStatus = "overdue";
              }
              
             return (
              <TaskRow key={tsk.id} title={tsk.name} project={projectName} deadline={tsk.deadline.toLocaleDateString()} status={taskStatus} />
             ) 
            })
          }
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <p className="mb-3 text-[13px] font-semibold text-white">My team</p>
        <div className="divide-y divide-white/[0.04]">
         {/* dynamic team id to be addedd later */}
          <QuickLink label="My Team"    sub=""  icon="👥" href={`/teams/${teamId}`} />   
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

export default async function Dashboard({
  searchParams
}:{
  searchParams: Promise<{ error? : string}>
}) {
  const {error} = await searchParams;
  const session = await auth();

  if(!session?.user) {
    return null;
  }
  const user = session?.user;
  console.log("User role = ", user.role)

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      {
        error && <ErrorAlert error={error} /> 
      }
      

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