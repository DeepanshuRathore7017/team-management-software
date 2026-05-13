import postgres from "postgres";
import { createProject } from "../actions";
import CreateButton from "@/components/CreateButton";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, {
  ssl: "require",
});

export default async function NewProjectPage() {
  const teams = await sql`
    SELECT id, name
    FROM teams WHERE id NOT IN (SELECT team_id FROM projects WHERE team_id IS NOT NULL)
    ORDER BY name ASC
  `;

  return (
    <main className="min-h-screen bg-[#0b1120] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Project
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Create and assign a project to your team.
          </p>
        </div>

        <form
          action={createProject}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Project Name
            </label>

            <input
              type="text"
              name="project_name"
              placeholder="Enter project name"
              required
              className="w-full rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3 text-sm outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Description
            </label>

            <textarea
              name="description"
              rows={5}
              placeholder="Write project description"
              className="w-full rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3 text-sm outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            <div className="space-y-2">
              <label className="text-sm text-slate-300">
                Assign Team
              </label>

              <select
                name="team_id"
                className="w-full rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3 text-sm outline-none"
              >
                <option value="">
                  Select team
                </option>

                {teams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

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

          <CreateButton to_create = 'Project'/>

        </form>
      </div>
    </main>
  );
}