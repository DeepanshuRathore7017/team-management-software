'use client';

// import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
    //   onClick={() => signOut({ callbackUrl: "/login" })}
      className="ml-2 font-bold cursor-pointer"
    >
      Log Out
    </button>
  );
}