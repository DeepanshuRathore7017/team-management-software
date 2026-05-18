"use client";

import { useFormStatus } from "react-dom";

export default function AddMemberInTeamButton() {
  const { pending } = useFormStatus();

  return (
    <button
        type="submit"
        disabled={pending}
        className={`${pending ? 'cursor-wait' : 'cursor-pointer'}  rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-[12px] font-medium text-blue-300 hover:bg-blue-500/20 transition-all disabled:opacity-50`}
    >
        {pending? "Adding Members...": "➕ Add Members"}
    </button>
  );
}