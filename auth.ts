import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import postgres from "postgres";
import bcrypt from "bcrypt";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not defined");
}

const sql = postgres(process.env.POSTGRES_URL, { ssl: "require" });

type User = {
    id: string,
    name: string,
    email: string,
    password: string,
    role: "admin" | "team_lead" | "team_member" | "on_bench"
}

async function getUser(email: string): Promise<User | null>{
    try{
        console.log("aya hai try mai yha");
        const allUsers = await sql`SELECT * FROM employees`;
        console.log(allUsers);
        const user = await sql<User[]>`SELECT * FROM employees WHERE email = ${email}`;
        return user[0] || null;
    } catch(err) {
        console.log("aya hai catch mai yha");
        console.log("Eror occured at auth.ts in getUser function: ", err);
        throw new Error("Failed to fetch user.");
    }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  secret: process.env.AUTH_SECRET,
  ...authConfig,

  
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          const parsedCredentials = z
            .object({
              email: z.string().email(),
              password: z.string().min(6),
            })
            .safeParse(credentials);

          if (!parsedCredentials.success) return null;

          const { email, password } = parsedCredentials.data;
          const normalizedEmail = email.toLowerCase().trim();

          // 🔵 Check user
          const user = await getUser(normalizedEmail);

          if(user && user.password) {
            const isMatch = await bcrypt.compare(
              password,
              user.password
            );

            if (isMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
          }

          return null;
        } catch (err) {
          console.error("Auth error:", err);
          return null;
        }
      },
    }),
  ],

  
});