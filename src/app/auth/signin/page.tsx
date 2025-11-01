"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const emailDisabled = process.env.NEXT_PUBLIC_DISABLE_EMAIL_SIGNIN === "1";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await signIn("email", {
        email,
        callbackUrl: "/dashboard",
        redirect: false,
      });
      if (res?.ok) {
        setMessage("Check your email for a sign-in link.");
      } else if (res?.error) {
        setMessage(res.error);
      } else {
        setMessage("Unable to send magic link. Check email config.");
      }
    } catch (err) {
      setMessage("Something went wrong. Check email config.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In to Agent Commerce SEO</CardTitle>
          <CardDescription>
            Enter your email to receive a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {!emailDisabled && (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <Button type="submit" disabled={isSubmitting || !email} className="w-full">
                  {isSubmitting ? "Sending..." : "Send Magic Link"}
                </Button>
              </>
            )}
            {process.env.NODE_ENV !== "production" && (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  setIsSubmitting(true);
                  setMessage(null);
                  try {
                    await signIn("credentials", {
                      email: email || "you@example.com",
                      callbackUrl: "/dashboard",
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                Dev Sign In (Bypass)
              </Button>
            )}
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
            {!emailDisabled && (
              <p className="text-xs text-muted-foreground">
                Email provider must be configured in environment variables.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
