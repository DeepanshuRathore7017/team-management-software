import postgres from "postgres";
import { notFound } from "next/navigation";
import { updateProject } from "../../actions";
import CreateButton from "@/components/CreateButton";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, {
  ssl: "require",
});

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ project_id: string }>;
}) {
  const { project_id } = await params;

  const [project] = await sql`
    SELECT *
    FROM projects
    WHERE id = ${project_id}
  `;

  if (!project) {
    notFound();
  }

  const teams = await sql`
    SELECT *
    FROM teams
    WHERE id NOT IN (
        SELECT team_id
        FROM projects
        WHERE team_id IS NOT NULL
    ) OR id = ${project.team_id}
    ORDER BY name ASC
    `;

  return (
    <main className="min-h-screen bg-[#020817] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mb-8">
            <h1 className="text-3xl font-bold">
                Edit Project
            </h1>

            <p className="mt-2 text-sm text-slate-400">
                Update project details
            </p>
        </div>

        <form
          action={updateProject.bind(null, project.id)}
          className="space-y-6"
        >
            {/* Project Name */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                Project Name
                </label>

                <input
                type="text"
                name="project_name"
                defaultValue={project.name}
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
                defaultValue={project.description}
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
                defaultValue={project.status}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
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
                    project.deadline
                    ? new Date(project.deadline)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                />
            </div>

            {/* Team */}
            <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                Team
                </label>

                <select
                name="team_id"
                defaultValue={project.team_id || ""}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
                >
                {/* <option value=''>No Team Assigned</option> */}

                {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                    {team.name}
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