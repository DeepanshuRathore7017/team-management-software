import postgres from "postgres";
import { createTeam } from "../actions";
import CreateButton from "@/components/CreateButton";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, {
  ssl: "require",
});

export default async function NewTeamPage() {
  const employees = await sql`
    SELECT id, name, role
    FROM employees
    WHERE role = 'on_bench'
    ORDER BY name
  `;

  const projects = await sql`
    SELECT id, name
    FROM projects
    WHERE team_id IS NULL
    ORDER BY name
  `;

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <main className="mx-auto max-w-3xl px-7 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Create New Team
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a team and assign members.
          </p>
        </div>

        <form
          action={createTeam}
          className="space-y-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6"
        >
          {/* Team name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Team Name
            </label>

            <input
              type="text"
              name="team_name"
              required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm outline-none"
              placeholder="Team Alpha"
            />
          </div>

          {/* Team Lead */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Team Lead
            </label>

            <select
              name="team_lead_id"
              className="w-full rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3 text-sm outline-none"
            >
              <option value="">
                Select team lead
              </option>

              {employees
                .map((e) => (
                  <option
                    key={e.id}
                    value={e.id}
                  >
                    {e.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Members */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Team Members
            </label>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/[0.06] p-4">
              {employees
                .map((e) => (
                  <label
                    key={e.id}
                    className="flex items-center gap-2 text-sm text-slate-300"
                  >
                    <input
                      type="checkbox"
                      name="member_ids"
                      value={e.id}
                    />

                    {e.name}
                  </label>
                ))}
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Assign Project
            </label>

            <select
              name="project_id"
              className="w-full rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3 text-sm outline-none"
            >
              <option value="">
                No Project
              </option>

              {projects.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <CreateButton to_create='Team' />
        </form>
      </main>
    </div>
  );
}