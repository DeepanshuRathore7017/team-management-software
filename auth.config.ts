import type { NextAuthConfig } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({
      auth,
      request: { nextUrl },
      }: {
        auth: { user?: any } | null;
        request: NextRequest;
      }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "admin";
      // console.log("session user = ", auth)

      const isOnLogin = nextUrl.pathname.startsWith("/login");
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnProjects = nextUrl.pathname.startsWith("/projects");
      const isOnTeams = nextUrl.pathname.startsWith("/teams");
      const isOnProjectsRoot = nextUrl.pathname === "/projects";
      const isOnTeamsRoot = nextUrl.pathname === "/teams";

      if(isLoggedIn && isOnLogin) {
        return NextResponse.redirect(
          new URL("/dashboard", nextUrl)
        );
      }

      if(!isLoggedIn && (isOnDashboard || isOnProjects || isOnTeams)) {
        return NextResponse.redirect(
          new URL("/login", nextUrl)
        );
      }

      if ((isOnTeamsRoot || isOnProjectsRoot) && !isAdmin) {
        return NextResponse.redirect(
          new URL("/dashboard", nextUrl)
        );
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as "admin" | "team_lead" | "team_member" | "on_bench";
      }
      return session;
    },
  },

  providers: [],
} satisfies NextAuthConfig;