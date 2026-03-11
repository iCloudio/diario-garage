"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
      router.push("/dashboard");
    });
  }

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card p-6 shadow-xl backdrop-blur">
        <h2 className="text-xl font-semibold text-foreground">Bentornato</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Il tuo garage sempre in regola, in pochi secondi.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
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
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <Link className="hover:text-foreground" href="/forgot-password">
            Password dimenticata?
          </Link>
          <Link className="hover:text-foreground" href="/register">
            Crea account
          </Link>
        </div>
      </Card>

      <div className="text-center">
        <a
          href="https://fulmi.net"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground transition hover:opacity-80"
        >
          <span>Sviluppato da</span>
          <Image
            src="/fulminetLogo.png"
            alt="Fulminet"
            width={64}
            height={14}
            className="inline-block"
          />
        </a>
      </div>
    </div>
  );
}
