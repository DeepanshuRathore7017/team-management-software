"use server";

import postgres from "postgres";
import { redirect } from "next/navigation";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, {
  ssl: "require",
});

export async function createTeam(
  formData: FormData
) {
  const teamName = formData.get("team_name")?.toString();

  const teamLeadId = formData.get("team_lead_id")?.toString() || null;

  const projectId = formData.get("project_id")?.toString();

  const memberIds = formData.getAll("member_ids").map((id) => id.toString());  

  if (!teamName) {
    throw new Error(
      "Missing required fields"
    );
  }

  // create team
  const [team] = await sql`
    INSERT INTO teams (
      name,
      open_tasks,
      completed_tasks
    )
    VALUES (
      ${teamName},
      0,
      0
    )
    RETURNING id
  `;

  // assign lead
  if(teamLeadId) {
    await sql`
      UPDATE employees
      SET team_id = ${team.id},
          role = 'team_lead'
      WHERE id = ${teamLeadId}
    `;
  }
  

  // assign members
  if (memberIds.length > 0) {
    await sql`
      UPDATE employees
      SET team_id = ${team.id}, role = 'team_member'
      WHERE id IN ${sql(memberIds)} AND id != ${teamLeadId}
    `;
  }

  // assign project
  if (projectId) {
    const log = `Project assigned to team ${teamName} on ${new Date().toDateString()}`;
    await sql`
      UPDATE projects
      SET team_id = ${team.id}, date_of_assigning = ${new Date()},
          team_name = ${teamName}, activity_logs = array_append(activity_logs, ${log})
      WHERE id = ${projectId}
    `;
  }

  redirect(`/teams/${team.id}`);
}

export async function deleteTeam(team_id: string) {
  // remove team from employees
  await sql`
    UPDATE employees
    SET team_id = NULL, team_name = NULL,
        role = 'on_bench'
    WHERE team_id = ${team_id}
  `;

  // remove team from projects
  await sql`
    UPDATE projects
    SET team_id = NULL,
        team_name = NULL
    WHERE team_id = ${team_id}
  `;

  // delete the team
  await sql`
    DELETE FROM teams
    WHERE id = ${team_id}
  `;

  redirect(`/teams`);
}

export async function addMemberInTeam(
  team_id: string,
  formData: FormData
) {
  const memberIds: string[] = formData.getAll("member_ids").map(String);

  const[{name: teamName}] = await sql`SELECT name FROM teams WHERE id = ${team_id}`;

  // console.log("Deatails at addMemberInTeamm fucntion = ");
  // console.log("Team id = ", team_id)
  // console.log("Team name = ", teamName)
  // console.log("Members to add = ", memberIds)

  if(!teamName || !team_id || !memberIds){
    console.log("Insuffient details")
    throw new Error("Insuffient Details");
  }

  await sql`
    UPDATE employees
    SET team_id = ${team_id}, team_name = ${teamName},
        role = 'team_member'
    WHERE id IN ${sql(memberIds)}
  `;
}

export async function removeTeamMember(
  member_id: string,
  team_id: string
) {
  await sql`
    UPDATE employees
    SET team_id = NULL,
        role = 'on_bench'
    WHERE id = ${member_id}
      AND team_id = ${team_id}
  `;
}

