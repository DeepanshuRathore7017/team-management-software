'use client';

import { useTransition } from "react";
import { logout } from "../lib/actions";

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(() => {
          logout();
        })
      }
      className="ml-2 font-bold cursor-pointer"
      disabled={pending}
    >
      {pending ? "Logging out..." : "Log Out"}
    </button>
  );
}