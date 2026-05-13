"use client";

import { useFormStatus } from "react-dom";

export default function DeleteButton({
  to_delete
}: {
  to_delete: string
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${pending ? 'cursor-wait' : 'cursor-pointer'}  rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[12px] font-medium text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50`}
    >
      {pending ? `🗑 Deleting ${to_delete}...` : `🗑 Delete ${to_delete}`}
    </button>
  );
}