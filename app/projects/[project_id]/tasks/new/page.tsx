import postgres from "postgres";
import CreateButton from "@/components/CreateButton";
import { createTask } from "../../../actions";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, {
  ssl: "require",
});

export default async function NewTaskPage({
    params
}: {
    params: Promise<{project_id: string}>
}) {
    const {project_id} = await params;

  const project_rows = await sql`
    SELECT id, name
    FROM projects
    WHERE id = ${project_id}
  `;

  const project = project_rows[0];

  const teams = await  sql`
    SELECT team_id as id FROM projects WHERE id = ${project_id}
  `;

  const teamId = teams[0].id;

  const employees = await sql`
    SELECT id, name
    FROM employees
    WHERE team_id = ${teamId}
  `;

  return (
    <main className="min-h-screen bg-[#0b1120] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {`Create New Task for ${project.name}`}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Create and assign tasks to employees.
          </p>
        </div>

        <form
          action={createTask.bind(null, project_id)}
          className="space-y-6"
        >

          {/* Task Name */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Task Name
            </label>

            <input
              type="text"
              name="task_name"
              placeholder="Enter task name"
              required
              className="w-full rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3 text-sm outline-none placeholder:text-slate-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Description
            </label>

            <textarea
              name="description"
              rows={5}
              placeholder="Write task description"
              className="w-full rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3 text-sm outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Assign Employee */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">
                Assign Employee
              </label>

              <select
                name="employee_id"
                className="w-full rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3 text-sm outline-none"
              >
                <option value="">
                  Select employee
                </option>

                {employees.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">
                Priority
              </label>

              <select
                name="priority"
                className="w-full rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3 text-sm outline-none"
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">
                Deadline
              </label>

              <input
                type="date"
                name="deadline"
                className="w-full rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3 text-sm outline-none"
              />
            </div>

          </div>

          <CreateButton to_create="Task" />

        </form>
      </div>
    </main>
  );
}