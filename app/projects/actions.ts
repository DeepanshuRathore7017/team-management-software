"use server";

import postgres from "postgres";
import { redirect } from "next/navigation";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, {
  ssl: "require",
});

export async function createProject(
  formData: FormData
) {
  const projectName = formData.get("project_name")?.toString();

  const description = formData.get("description")?.toString() || null;

  const teamId = formData.get("team_id")?.toString() || null;

  const deadline = formData.get("deadline")?.toString() || null;

  const status = 'pending';

  if (!projectName) {
    throw new Error("Project name is required");
  }

  const existingProject = await sql`
    SELECT id
    FROM projects
    WHERE LOWER(name) = LOWER(${projectName})
  `;

  if (existingProject.length > 0) {
    throw new Error("Project already exists");
  }

  let teamName : string | null = null;

  if (teamId) {
    const [team] = await sql`
      SELECT name
      FROM teams
      WHERE id = ${teamId}
    `;

    teamName = team?.name || null;
  }
  
  const currentDate = new Date();
  const date_of_assigning = teamId ? currentDate : null;
  const activity_logs = [
    `Project created by Admin on ${currentDate.toDateString()}`,
  ];

  if (teamName) {
    activity_logs.push(
      `Project assigned to team ${teamName} on ${currentDate.toDateString()}`
    );
  }

  const [project] = await sql`
    INSERT INTO projects (
      name,
      description,
      team_id,
      team_name,
      date_of_creation,
      date_of_assigning,
      deadline,
      status,
      progress,
      activity_logs
    )
    VALUES (
      ${projectName},
      ${description},
      ${teamId},
      ${teamName},
      ${new Date()},
      ${date_of_assigning},
      ${deadline},
      ${status},
      ${0},
      ${activity_logs}
    )
    RETURNING id
  `;

  redirect(`/projects/${project.id}`);
}

export async function deleteProject(projectId: string) {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  // remove team assignment before deleting
  await sql`
    UPDATE teams
    SET
      open_tasks = 0,
      completed_tasks = 0
    WHERE id IN (
      SELECT team_id
      FROM projects
      WHERE id = ${projectId}
    )
  `;

  // delete all tasks related to this project
  await sql`
    DELETE FROM tasks
    WHERE project_id = ${projectId}
  `;

  // delete project
  await sql`
    DELETE FROM projects
    WHERE id = ${projectId}
  `;

  redirect("/projects");
}

export async function updateProject(
  projectId: string,
  formData: FormData
) {
  const project_rows = await sql`SELECT * FROM projects WHERE id = ${projectId}`;
  const project = project_rows[0];

  const projectName = formData.get("project_name")?.toString() || "";
  const description = formData.get("description")?.toString() || null;
  const status = formData.get("status")?.toString() || project.status;
  const deadline = formData.get("deadline")?.toString() || null;
  const teamId = formData.get("team_id")?.toString() || null;

  if((project.name == projectName) && (project.description == description) && (project.status == status) && (project.deadline == deadline) && (project.team_id == teamId)) {
    throw new Error("No change found between new and old entries.");
  }

  if(teamId == null) {
    throw new Error("Assign a team.");
  }

  let teamName = null;

  if (teamId) {
    const [team] = await sql`
      SELECT name
      FROM teams
      WHERE id = ${teamId}
    `;

    teamName = team?.name || null;
  }

  await sql`
    UPDATE projects
    SET
      name = ${projectName},
      description = ${description},
      status = ${status},
      deadline = ${deadline},
      team_id = ${teamId},
      team_name = ${teamName},
    WHERE id = ${projectId}
  `;

  redirect(`/projects/${projectId}`);
}

export async function createTask(
  project_id: string,
  formData: FormData
) {
  const taskName = formData.get("task_name")?.toString() || "";

  const description = formData.get("description")?.toString() || null;

  const employeeId = formData.get("employee_id")?.toString() || null;

  const priority = formData.get("priority")?.toString() || "low";

  const deadline = formData.get("deadline")?.toString() || null;

  if (!taskName) {
    throw new Error("Missing required fields");
  }

  // fetch project
  const [project] = await sql`
    SELECT id, name
    FROM projects
    WHERE id = ${project_id}
  `;

  let employee;
  // fetch employee
  if(employeeId) {
    [employee] = await sql`
      SELECT email
      FROM employees
      WHERE id = ${employeeId}
    `;
  }

  const employeeEmail = employee?.email || null;

  if (!project) {
    throw new Error("Invalid project");
  }

  const duplicate_task = await sql`SELECT id from tasks WHERE name = ${taskName}`;

  if(duplicate_task.length > 0) {
    throw new Error('Task with same name already exists');
  }

  const status = "pending";

  const activity_logs = [
    `Task created on ${new Date().toDateString()}`,
  ];

  let date_of_assigning = null;
  if(employeeId) {
    date_of_assigning = new Date();
    activity_logs.push(`Assigned to ${employee?.name} on ${date_of_assigning.toDateString()}`)
  }

  const [task] = await sql`
    INSERT INTO tasks (
      name,
      description,
      project_id,
      assigned_emp_id,
      assigned_emp_email,
      priority,
      deadline,
      status,
      activity_logs,
      date_of_creation,
      date_of_assigning
    )
    VALUES (
      ${taskName},
      ${description},
      ${project.id},
      ${employeeId},
      ${employeeEmail},
      ${priority},
      ${deadline},
      ${status},
      ${activity_logs},
      ${new Date()},
      ${date_of_assigning}
    )
    RETURNING id
  `;

  // update team's open tasks count
  await sql`
    UPDATE teams
    SET open_tasks = (open_tasks::integer + 1)::text
    WHERE id = (
      SELECT team_id
      FROM projects
      WHERE id = ${project_id}
    )
  `;

  if(project.status == 'completed') {
    await sql`UPDATE projects SET status = 'active' WHERE id = ${project_id}`;
  }

  redirect(`/projects/${project_id}/tasks/${task.id}`);
}