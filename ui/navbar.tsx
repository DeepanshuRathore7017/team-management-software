import Image from "next/image";
import Link from "next/link";
// import { auth } from "@/auth";
import LogoutButton from "./logout-button";
import { mock } from "node:test";

type Role = "admin" | "team_lead" | "team_member" | "on_bench";

const mockUser = {
  name: "Aryan Sharma",
  email: "aryan@ethara.ai",
  role: "admin" as Role,
  avatar: "A",
};

export async function Nav() {
//   const session = await auth();
//   const isLoggedIn = session?.user;

const isLoggedIn = false;

  const navLinks = [
    {name: 'Explore', link: '/explore'},
    {name: 'How it Works', link: '/how-it-works'},
    {name: 'Charities', link: '/charities'},
    {name: 'Pricing', link: '/pricing'},    
  ]

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LEFT */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold font-serif text-primary tracking-tight">
              Golf Heroes
            </Link>

            <nav className="hidden md:flex ml-10 space-x-8 text-sm font-medium">
              {navLinks.map((item, ind) => (
                <Link
                  key={ind}
                  href={item.link}
                  className="text-muted hover:text-primary transition"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center space-x-4 text-sm">

            <Link href="/support" className="text-muted hover:text-primary transition">
              Support
            </Link>

            <Link href="/contact-us" className="text-muted hover:text-primary transition">
              Contact Sales
            </Link>

            {/* CTA */}
            {isLoggedIn ? 
            <LogoutButton/>: 
            <Link
              href="/explore"
              className="bg-primary text-white px-4 py-2 rounded-md font-medium shadow-sm hover:opacity-90 transition"
            >
              Get Started
            </Link> }
            

            {/* AUTH */}
            {isLoggedIn ? (
              <Link href="/admin-dashboard">
                <Image
                  width={36}
                  height={36}
                  className="rounded-full border border-border hover:scale-105 transition"
                  src="/user.png"
                  alt="user"
                />
              </Link>
            ) : (
              <Link
                href="/login"
                className="border border-border px-3 py-1.5 rounded-md hover:bg-card transition"
              >
                Sign in
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}

export default function Navbar() {
  const badgeMap: Record<Role, { label: string; cls: string }> = {
    admin:       { label: "ADMIN",       cls: "bg-violet-500/15 border-violet-500/35 text-violet-300" },
    team_lead:   { label: "TEAM LEAD",   cls: "bg-cyan-500/15 border-cyan-500/35 text-cyan-300" },
    team_member: { label: "TEAM MEMBER", cls: "bg-blue-500/15 border-blue-500/35 text-blue-300" },
    on_bench:    { label: "ON BENCH",    cls: "bg-amber-500/15 border-amber-500/35 text-amber-300" },
  };
  const b = badgeMap[mockUser.role];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-7 py-3.5">
        <Link href='/' className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/25 text-sm">
            <img src="/ethara-logo.png" alt="" />
          </div>
          <span className="text-[15px] font-semibold tracking-wide text-white">Ethara Manager</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className={`rounded-full border px-3 py-0.5 text-[11px] font-semibold tracking-wide ${b.cls}`}>{b.label}</span>
          <Link href='/dashboard'>
            <img className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-white" src='/user-icon.jpeg' alt=''/>
          </Link>
          
        </div>
      </div>
    </nav>
  );
}