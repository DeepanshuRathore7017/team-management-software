"use client";

import { useEffect } from "react";

export default function ErrorAlert({
  error,
}: {
  error?: string;
}) {
  useEffect(() => {
    
    alert(
        `Due to ${error}, you were redirected to dashboard.`
    );
    
  }, [error]);

  return null;
}