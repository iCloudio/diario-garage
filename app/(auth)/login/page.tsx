"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        toast.error(payload?.error ?? "Accesso non riuscito.");
        return;
      }

      toast.success("Bentornato!");
      router.push("/vehicles");
    });
  }

  return (
    <div className="w-full">
      <Card className="border-border/80 bg-card/88 p-5 shadow-2xl backdrop-blur sm:p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tuo@email.it"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? "Accesso..." : "Entra"}
          </Button>
        </form>
        <div className="mt-4 flex flex-col items-center gap-3 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:gap-0">
          <Link className="transition hover:text-foreground" href="/forgot-password">
            Password dimenticata?
          </Link>
          <Link className="transition hover:text-foreground" href="/register">
            Crea account
          </Link>
        </div>
      </Card>
    </div>
  );
}
