import postgres from "postgres";
import { notFound } from "next/navigation";
import { updateTask } from "../../../../actions";
import CreateButton from "@/components/CreateButton";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, {
  ssl: "require",
});

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ task_id: string }>;
}) {
  const { task_id } = await params;

  const [task] = await sql`
    SELECT *
    FROM tasks
    WHERE id = ${task_id}
  `;

  if (!task) {
    notFound();
  }

  const project_rows = await sql`SELECT team_id FROM projects WHERE id = ${task.project_id}`;
  const teamId = project_rows[0].team_id;

  const employees = await sql`
    SELECT *
    FROM employees WHERE team_id = ${teamId}
    ORDER BY name ASC
  `;

  return (
    <main className="min-h-screen bg-[#020817] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Task</h1>

          <p className="mt-2 text-sm text-slate-400">
            Update task details
          </p>
        </div>

        <form
          action={updateTask.bind(null, task.id)}
          className="space-y-6"
        >
          {/* Task Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Task Name
            </label>

            <input
              type="text"
              name="task_name"
              defaultValue={task.name}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>

            <textarea
              name="description"
              rows={5}
              defaultValue={task.description}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Status
            </label>

            <select
              name="status"
              defaultValue={task.status}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Priority
            </label>

            <select
              name="priority"
              defaultValue={task.priority}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Deadline
            </label>

            <input
              type="date"
              name="deadline"
              defaultValue={
                task.deadline
                  ? new Date(task.deadline)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            />
          </div>


          {/* Assigned Employee */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Assigned To
            </label>

            <select
              name="employee_id"
              defaultValue={task.employee_id || ""}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            >
              <option value="">Unassigned</option>

              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <CreateButton to_create="Changes" />
        </form>
      </div>
    </main>
  );
}