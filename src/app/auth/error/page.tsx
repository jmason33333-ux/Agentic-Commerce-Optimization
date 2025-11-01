"use client";

import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const err = params.get("error") || "Unknown";
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-xl font-semibold mb-2">Authentication Error</h1>
        <p className="text-sm text-muted-foreground mb-4">{err}</p>
        <a href="/auth/signin" className="underline text-sm">Back to sign in</a>
      </div>
    </div>
  );
}


