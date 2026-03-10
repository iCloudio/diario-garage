import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Piano</p>
        <h2 className="mt-2 text-2xl font-semibold">Piano attuale</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Scegli il piano adatto al tuo garage.
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Piano attuale</p>
            <p className="mt-2 text-xl font-semibold">Free</p>
          </div>
          <Badge variant="secondary">MVP</Badge>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          1 veicolo · 1 guidatore · scadenze base
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/pricing">Vedi piani</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/pricing">Passa a Family</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
