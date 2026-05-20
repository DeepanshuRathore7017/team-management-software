import Image from "next/image";
import Link from "next/link";
import LogoutButton from "../components/logout-button";
import { mock } from "node:test";
import { auth } from "@/auth";

type Role = "admin" | "team_lead" | "team_member" | "on_bench";



export default async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const badgeMap: Record<Role, { label: string; cls: string }> = {
    admin:       { label: "ADMIN",       cls: "bg-violet-500/15 border-violet-500/35 text-violet-300" },
    team_lead:   { label: "TEAM LEAD",   cls: "bg-cyan-500/15 border-cyan-500/35 text-cyan-300" },
    team_member: { label: "TEAM MEMBER", cls: "bg-blue-500/15 border-blue-500/35 text-blue-300" },
    on_bench:    { label: "ON BENCH",    cls: "bg-amber-500/15 border-amber-500/35 text-amber-300" },
  };
  
  if (!user?.role) {
    return null;
  }

  const b = badgeMap[user.role];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-7 py-3.5">
        <Link href='/' className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/25 text-sm">
            <img src="/logo.jpeg" alt="" />
          </div>
          <span className="text-[15px] font-semibold tracking-wide text-white">TeamSync</span>
        </Link>
        {
          user && <div className="flex items-center gap-3">
            <span className={`rounded-full border px-3 py-0.5 text-[11px] font-semibold tracking-wide ${b.cls}`}>{b.label}</span>
            <Link href='/dashboard'>
              <img className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-white" src='/user-icon.jpeg' alt=''/>
            </Link>
            <LogoutButton/>
          </div>
        }
        
      </div>
    </nav>
  );
}