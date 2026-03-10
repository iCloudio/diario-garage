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

      setSent(true);
      toast.success("Se esiste, abbiamo inviato le istruzioni.");
    });
  }

  return (
    <Card className="border-white/10 bg-black/40 p-6 shadow-xl backdrop-blur">
      <h2 className="text-xl font-semibold text-white">Reset password</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Inserisci la tua email. Per ora è una simulazione.
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
      <div className="mt-4 text-xs text-zinc-400">
        <Link className="hover:text-white" href="/login">
          Torna al login
        </Link>
      </div>
    </Card>
  );
}
