"use client";

import { useFormStatus } from "react-dom";

export default function RemoveTeamMemberButton() {
  const { pending } = useFormStatus();

  return (
    <button
        type="submit"
        disabled={pending}
        className={`${pending ? 'cursor-wait' : 'cursor-pointer'} rounded-lg bg-red-500/10 px-2.5 py-1 text-[11px] text-red-400 hover:bg-red-500/20`}
    >
        {pending? "Removing...": "Remove"}
    </button>
  );
}