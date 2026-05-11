import postgres from 'postgres'
import bcrypt from 'bcrypt'

import { employees, teams, projects, tasks } from "./placeholder-data";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}
const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

/* ------------------ HELPERS ------------------ */
const formatDate = (dateStr: string)  => {
  const [day, month, year] = dateStr.split("-");
  return `${year}-${month}-${day}`; // YYYY-MM-DD
};

async function seedEmployees() {
  await sql`DROP TABLE IF EXISTS employees`
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS employees (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password VARCHAR(255),      
      team_id VARCHAR(255),
      team_name VARCHAR(255),
      position VARCHAR(255) CHECK(position IN('Senior Software Engineer', 'Frontend Engineer', 'QA Engineer', 'Backend Engineer', 'Tester', 'Devops Engineer')),
      role VARCHAR(10) CHECK(role IN('admin', 'team_lead', 'team_member', 'on_bench'))
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );
  `;

  for (const emp of employees) {
    const encryptedPassword = await bcrypt.hash(emp.password, 10);
    const team_rows = await sql`SELECT id FROM teams WHERE name = ${emp.team_name}`;
    const teamId = team_rows[0]?.id;

    await sql`
      INSERT INTO employees (
        name, email, password, team_id, team_name,
        position, role
      )
      VALUES (
        ${emp.name}, ${emp.email}, ${encryptedPassword},
        ${teamId}, ${emp.team_name}, ${emp.position}, ${emp.role}
      )
      ON CONFLICT (email) DO NOTHING;
    `;
  }
}

async function seedTeams() {
  await sql`DROP TABLE IF EXISTS teams`
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(100),
      open_tasks VARCHAR(255),
      completed_tasks VARCHAR(255)
    );
  `;

  for (const team of teams) {
    await sql`
      INSERT INTO teams (
        name, open_tasks, completed_tasks
      )
      VALUES
        ${team.name}, ${team.open_tasks}, ${team.completed_tasks}
      )
      ON CONFLICT (name) DO NOTHING;
    `;
  }
}

async function seedProjects() {
  await sql`DROP TABLE IF EXISTS projects`
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(100),
      description VARCHAR(255),
      team_id VARCHAR(100),
      team_name VARCHAR(255),
      status VARCHAR(100),
      team_lead VARCHAR(100),
      date_of_creation DATE,
      date_of_assigning DATE,
      deadline DATE,
      progress VARCHAR(100),
      tasks TEXT[],
      activity_logs TEXT[],
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );
  `;

  for (const prj of projects) {
    const team_rows = await sql`SELECT id, lead FROM teams WHERE name = ${prj.team_name}`;
    const teamId=  team_rows[0]?.id;
    const teamLead=  team_rows[0]?.lead;

    await sql`
      INSERT INTO projects (
        name, description, team_id, team_name, status, team_lead, date_of_creation, date_of_assigning, deadline, progress,
        tasks, activity_logs
      )
      VALUES (
        ${prj.name}, ${prj.description}, ${teamId}, ${prj.team_name}, ${prj.status}, ${teamLead}, 
        ${prj.date_of_creation}, ${prj.date_of_assigning}, ${prj.deadline}, ${prj.progress}, ${prj.tasks}, ${prj.activity_logs}
      )
      ON CONFLICT (name) DO NOTHING;
    `;
  }
}

async function seedTasks() {
  await sql`DROP TABLE IF EXISTS tasks`
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(100),
      description VARCHAR(255),
      project_id VARCHAR(100),
      project_name VARCHAR(255),
      assigned_emp_id VARCHAR(100),
      assigned_emp_email VARCHAR(100),
      date_of_creation DATE,
      date_of_assigning DATE,
      deadline DATE,
      status VARCHAR(100),
      priority VARCHAR(100),
      activity_logs TEXT[],
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (assigned_emp_id) REFERENCES employees(id)
    );
  `;

  for (const tsk of tasks) {
    const emp_rows = await sql`SELECT id, team_id FROM employees WHERE email = ${tsk.assigned_emp_email}`;
    const empId=  emp_rows[0]?.id;
    const teamId = emp_rows[0]?.team_id;

    const project_rows = await sql`SELECT id, name FROM projects WHERE team_id = ${teamId}`
    const projectId=  project_rows[0]?.id;
    const prjectName = project_rows[0]?.name;

    await sql`
      INSERT INTO projects (
        name, description, project_id, project_name, assigned_emp_id, assigned_emp_email, 
        status, date_of_creation, date_of_assigning, deadline, priority, activity_logs
      )
      VALUES (
        ${tsk.name}, ${tsk.description}, ${projectId}, ${prjectName}, ${empId}, ${tsk.assigned_emp_email}, 
        ${tsk.status}, ${tsk.date_of_creation}, ${tsk.date_of_assigning}, ${tsk.deadline}, ${tsk.priority}, ${tsk.activity_logs}
      )
      ON CONFLICT (name) DO NOTHING;
    `;
  }
}

export async function seedDatabase(){
    try{
        console.log("🌱 Seeding database...");


        console.log("✅ Seeding completed!");
    } catch(error) {
        console.error("❌ Seeding failed:", error);
        throw error;
    }
}