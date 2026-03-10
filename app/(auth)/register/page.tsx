"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        toast.error(payload?.error ?? "Registrazione non riuscita.");
        return;
      }

      toast.success("Account creato!");
      router.push("/dashboard");
    });
  }

  return (
    <Card className="border-white/10 bg-black/40 p-6 shadow-xl backdrop-blur">
      <h2 className="text-xl font-semibold text-white">Crea un account</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Bastano pochi dati per iniziare.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Nome (opzionale)</Label>
          <Input
            id="name"
            type="text"
            placeholder="Claudio"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
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
            placeholder="Almeno 8 caratteri"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? "Creazione..." : "Crea account"}
        </Button>
      </form>
      <div className="mt-4 text-xs text-zinc-400">
        Hai già un account?{" "}
        <Link className="hover:text-white" href="/login">
          Accedi
        </Link>
      </div>
    </Card>
  );
}
