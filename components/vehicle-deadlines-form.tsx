"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type DeadlineInput = {
  type: "BOLLO" | "REVISIONE" | "ASSICURAZIONE";
  dueDate?: string;
  amount?: number | null;
};

const TYPES: Array<{ type: DeadlineInput["type"]; label: string }> = [
  { type: "ASSICURAZIONE", label: "Assicurazione" },
  { type: "BOLLO", label: "Bollo" },
  { type: "REVISIONE", label: "Revisione" },
];

type FormState = Record<DeadlineInput["type"], { dueDate: string; amount: string }>;

function buildInitialState(deadlines: DeadlineInput[]): FormState {
  return TYPES.reduce<FormState>((acc, item) => {
    const match = deadlines.find((d) => d.type === item.type);
    acc[item.type] = {
      dueDate: match?.dueDate ?? "",
      amount: match?.amount != null ? String(match.amount) : "",
    };
    return acc;
  }, {} as FormState);
}

export function VehicleDeadlinesForm({
  vehicleId,
  deadlines,
  embedded = false,
  mode = "manage",
  onSuccess,
  onCancel,
}: {
  vehicleId: string;
  deadlines: DeadlineInput[];
  embedded?: boolean;
  mode?: "setup" | "manage";
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(() => buildInitialState(deadlines));
  const showInlineAmounts = mode === "manage";

  function updateField(type: DeadlineInput["type"], field: "dueDate" | "amount", value: string) {
    setForm((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const payload = TYPES.map(({ type }) => ({
        type,
        dueDate: form[type].dueDate,
        amount: form[type].amount === "" ? null : Number(form[type].amount),
      }));

      const response = await fetch("/api/deadlines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, deadlines: payload }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.error ?? "Salvataggio non riuscito.");
        return;
      }

      router.refresh();
      toast.success("Scadenze salvate.");
      onSuccess?.();
    });
  }

  const content = (
    <>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarClock className="h-4 w-4" />
        <p className="font-medium text-foreground">
          {mode === "setup" ? "Imposta le scadenze principali" : "Scadenze principali"}
        </p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {mode === "setup"
          ? "Parti dalle date di assicurazione, bollo e revisione. Gli importi sono facoltativi e puoi aggiungerli anche dopo."
          : "Inserisci prima la data di scadenza. Il prezzo e&apos; facoltativo e puoi aggiungerlo anche in un secondo momento."}
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {TYPES.map((item) => (
          <div
            key={item.type}
            className={
              showInlineAmounts
                ? "grid gap-3 md:grid-cols-[1.2fr_1fr_1fr]"
                : "grid gap-3 md:grid-cols-[1.2fr_1fr]"
            }
          >
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{item.label}</span>
            </div>
            <div className="space-y-2">
              <Label>Scadenza</Label>
              <Input
                type="date"
                value={form[item.type].dueDate}
                onChange={(event) => updateField(item.type, "dueDate", event.target.value)}
              />
            </div>
            {showInlineAmounts ? (
              <div className="space-y-2">
                <Label>Prezzo (opzionale)</Label>
                <div className="relative">
                  <Euro className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-9"
                    value={form[item.type].amount}
                    onChange={(event) => updateField(item.type, "amount", event.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ))}

        {!showInlineAmounts ? (
          <details className="rounded-2xl border border-border/80 bg-background/55 p-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
              Aggiungi anche gli importi opzionali
            </summary>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {TYPES.map((item) => (
                <div key={`${item.type}-amount`} className="space-y-2">
                  <Label>{item.label}</Label>
                  <div className="relative">
                    <Euro className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-9"
                      value={form[item.type].amount}
                      onChange={(event) => updateField(item.type, "amount", event.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              ))}
            </div>
          </details>
        ) : null}

        <div className="flex justify-end gap-2">
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
              {mode === "setup" ? "Più tardi" : "Annulla"}
            </Button>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending
              ? "Salvataggio..."
              : mode === "setup"
                ? "Salva e continua"
                : "Salva scadenze"}
          </Button>
        </div>
      </form>
    </>
  );

  return embedded ? (
    content
  ) : (
    <Card className="border-border/80 bg-card/90 p-6">{content}</Card>
  );
}
