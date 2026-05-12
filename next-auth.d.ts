import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "team_lead" | "team_member" | "on_bench";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "admin" | "team_lead" | "team_member" | "on_bench";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "team_lead" | "team_member" | "on_bench";
  }
}