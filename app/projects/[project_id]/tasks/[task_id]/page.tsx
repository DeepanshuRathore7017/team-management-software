// TaskDetail.tsx — /projects/[project_id]/tasks/[task_id]
// Team members can update status; Team Lead / Admin can edit everything
'use client'
import { useState } from "react";

type TaskStatus = "todo" | "in_progress" | "done";
type UserRole   = "team_lead" | "team_member" | "admin";

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

const MOCK_TASK: TaskDetail = {
  id: "t2",
  name: "Build REST API endpoints",
  desc: "Implement all REST API endpoints for the auth, projects, and tasks modules. Endpoints should follow RESTful conventions with proper HTTP status codes, request validation, and JWT-based authentication middleware. Include Swagger documentation for all routes.",
  status: "in_progress",
  priority: "high",
  createdAt: "Feb 12, 2025",
  assignedDate: "Feb 14, 2025",
  deadline: "Jun 18, 2025",
  daysRemaining: 38,
  isOverdue: false,
  project: "Ethara Platform v2",
  projectId: "1",
  team: "Team Alpha",
  assignee: "Vikram Das",
  assigneeInitial: "V",
  assigneeColor: "bg-emerald-500",
  assigneeRole: "Backend Developer",
  activity: [
    { icon: "✅", text: "updated status to In Progress",   highlight: "Vikram Das",  time: "Today, 10:24 AM" },
    { icon: "👤", text: "assigned task to Vikram Das",      highlight: "Rahul Verma", time: "Feb 14, 9:00 AM" },
    { icon: "📋", text: "created this task",                highlight: "Rahul Verma", time: "Feb 12, 11:30 AM" },
  ],
};

const STATUS_STEPS: { value: TaskStatus; label: string; icon: string }[] = [
  { value: "todo",        label: "To Do",       icon: "○" },
  { value: "in_progress", label: "In Progress", icon: "◑" },
  { value: "done",        label: "Done",        icon: "●" },
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
              onClick={() => canUpdate && onChange(s.value)}
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

export default function TaskDetail() {
  const currentRole: UserRole = "team_member"; // replace with sessionStorage role
  const task = MOCK_TASK;

  // In real app: check if sessionStorage id === task.assigneeId
  const isAssignee = true;
  const canEdit    = currentRole === "team_lead" || currentRole === "admin";
  const canUpdate  = isAssignee || canEdit;

  const [status, setStatus] = useState<TaskStatus>(task.status);

  const currentStatusCfg = {
    todo:        { label: "To Do",       pill: "bg-slate-700/60 text-slate-400 border-slate-600/30" },
    in_progress: { label: "In Progress", pill: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    done:        { label: "Done",        pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  }[status];

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
            <StatusUpdater current={status} onChange={setStatus} canUpdate={canUpdate} />
            <MetaSidebar task={task} />
          </div>
        </div>
      </main>
    </div>
  );
}