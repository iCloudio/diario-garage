"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const currencies = [
  { value: "EUR", label: "Euro (EUR)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "GBP", label: "Sterlina (GBP)" },
  { value: "CHF", label: "Franco svizzero (CHF)" },
];

export function CurrencySettingsForm({ initialCurrency }: { initialCurrency: string }) {
  const [currency, setCurrency] = useState(initialCurrency);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Valuta</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Usata per grafici, spese e riepiloghi economici.
        </p>
      </div>
      <Select
        value={currency}
        onValueChange={(value) => {
          setCurrency(value);
          startTransition(async () => {
            const response = await fetch("/api/settings/currency", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ currency: value }),
            });

            if (!response.ok) {
              toast.error("Salvataggio valuta non riuscito.");
              return;
            }

            toast.success("Valuta aggiornata.");
          });
        }}
      >
        <SelectTrigger className="w-full max-w-xs" disabled={pending}>
          <SelectValue placeholder="Seleziona valuta" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
