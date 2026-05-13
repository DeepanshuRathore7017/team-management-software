"use client";

import { useFormStatus } from "react-dom";

export default function CreateButton({
  to_create
} : {
  to_create: string
}) {
  const { pending } = useFormStatus();

  return (
    <button
        type="submit"
        disabled={pending}
        className={`${pending ? 'cursor-wait' : 'cursor-pointer'} w-full rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-300 transition-all hover:bg-blue-500/20 disabled:opacity-50`}
    >
        {pending? `🚀 Creating ${to_create}...`: `🚀 Create ${to_create}`}
    </button>
  );
}