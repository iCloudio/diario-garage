"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetPasswordFormProps = {
  initialToken: string;
};

export function ResetPasswordForm({ initialToken }: ResetPasswordFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [token] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [completed, setCompleted] = useState(false);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(payload?.error ?? "Reset password non riuscito.");
        return;
      }

      setCompleted(true);
      toast.success("Password aggiornata.");
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <Card className="border-border bg-card p-6 shadow-xl backdrop-blur">
      <h2 className="text-xl font-semibold text-foreground">Nuova password</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Imposta una nuova password per il tuo account.
      </p>

      {!token ? (
        <div className="mt-6 rounded-2xl border border-border/80 bg-muted/30 p-4 text-sm text-muted-foreground">
          Link di reset non valido. Richiedi una nuova email di reset.
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">Nuova password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Almeno 8 caratteri"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={pending || completed}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Conferma password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Ripeti la password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              disabled={pending || completed}
            />
          </div>
          <Button className="w-full" type="submit" disabled={pending || completed}>
            {completed ? "Password aggiornata" : pending ? "Salvataggio..." : "Aggiorna password"}
          </Button>
        </form>
      )}

      <div className="mt-4 text-xs text-muted-foreground">
        <Link className="hover:text-foreground" href="/login">
          Torna al login
        </Link>
      </div>
    </Card>
  );
}
