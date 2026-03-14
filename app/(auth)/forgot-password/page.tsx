"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        toast.error(payload?.error ?? "Operazione non riuscita.");
        return;
      }

      const payload = await response.json().catch(() => null);
      setSent(true);
      toast.success("Se esiste, abbiamo inviato le istruzioni.");
      setDevResetUrl(payload?.resetUrl ?? null);
    });
  }

  return (
    <Card className="border-border bg-card p-6 shadow-xl backdrop-blur">
      <h2 className="text-xl font-semibold text-foreground">Reset password</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Inserisci la tua email per ricevere un link di reset.
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
            disabled={sent}
          />
        </div>
        <Button className="w-full" type="submit" disabled={pending || sent}>
          {sent ? "Richiesta inviata" : pending ? "Invio..." : "Invia"}
        </Button>
      </form>
      {devResetUrl ? (
        <div className="mt-4 rounded-2xl border border-border/80 bg-muted/30 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Link di sviluppo</p>
          <p className="mt-1 break-all">{devResetUrl}</p>
          <Link className="mt-2 inline-block text-primary hover:underline" href={devResetUrl}>
            Apri link di reset
          </Link>
        </div>
      ) : null}
      <div className="mt-4 text-xs text-muted-foreground">
        <Link className="hover:text-foreground" href="/login">
          Torna al login
        </Link>
      </div>
    </Card>
  );
}
