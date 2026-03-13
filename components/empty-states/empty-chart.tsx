import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

type EmptyChartProps = {
  /**
   * Current number of data points
   */
  currentCount: number;
  /**
   * Minimum required data points to show chart
   */
  requiredCount?: number;
  /**
   * Type of data being collected
   */
  dataType: "spese" | "rifornimenti" | "movimenti";
  /**
   * CTA button text
   */
  ctaLabel: string;
  /**
   * CTA button href
   */
  ctaHref: string;
};

/**
 * Empty Chart Illustration
 * Simple inline SVG for chart placeholder
 */
function ChartIllustration() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground/30"
    >
      {/* Chart axes */}
      <line
        x1="20"
        y1="20"
        x2="20"
        y2="100"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="20"
        y1="100"
        x2="140"
        y2="100"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Chart bars (faded) */}
      <g opacity="0.3">
        <rect x="35" y="70" width="20" height="30" fill="currentColor" rx="2" />
        <rect x="70" y="50" width="20" height="50" fill="currentColor" rx="2" />
        <rect x="105" y="60" width="20" height="40" fill="currentColor" rx="2" />
      </g>

      {/* Trend icon */}
      <circle cx="80" cy="35" r="25" fill="currentColor" opacity="0.1" />
      <TrendingUp className="absolute left-1/2 top-8 h-8 w-8 -translate-x-1/2" />
    </svg>
  );
}

/**
 * Empty Chart State
 * Displayed when there's not enough data to render a meaningful chart
 */
export function EmptyChart({
  currentCount,
  requiredCount = 3,
  dataType,
  ctaLabel,
  ctaHref,
}: EmptyChartProps) {
  const remaining = requiredCount - currentCount;

  return (
    <Card className="border-dashed border-border/80 bg-card/75 p-6" role="status">
      <div className="flex flex-col items-center text-center">
        {/* Illustration */}
        <div className="relative mb-4" aria-hidden="true">
          <ChartIllustration />
        </div>

        {/* Progress message */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Grafico in arrivo!
          </p>
          <p className="text-sm text-muted-foreground">
            {currentCount > 0 ? (
              <>
                Hai registrato <span className="font-semibold">{currentCount}</span>{" "}
                {dataType}.
                <br />
                Aggiungine{" "}
                <span className="font-semibold">
                  {remaining === 1 ? "ancora 1" : `altre ${remaining}`}
                </span>{" "}
                per visualizzare i grafici.
              </>
            ) : (
              <>
                Registra almeno <span className="font-semibold">{requiredCount}</span>{" "}
                {dataType} per visualizzare i grafici e analizzare l&apos;andamento.
              </>
            )}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full max-w-xs">
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>{currentCount}/{requiredCount}</span>
            <span>{Math.round((currentCount / requiredCount) * 100)}%</span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={currentCount}
            aria-valuemin={0}
            aria-valuemax={requiredCount}
          >
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.min((currentCount / requiredCount) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Button asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
