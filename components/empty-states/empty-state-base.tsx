import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateBaseProps = {
  /**
   * SVG illustration component or element
   */
  illustration: ReactNode;
  /**
   * Main heading text
   */
  title: string;
  /**
   * Descriptive text explaining the empty state
   */
  description: string;
  /**
   * Primary CTA button text
   */
  primaryActionLabel: string;
  /**
   * Primary CTA button href
   */
  primaryActionHref: string;
  /**
   * Optional secondary link text
   */
  secondaryActionLabel?: string;
  /**
   * Optional secondary link href
   */
  secondaryActionHref?: string;
  /**
   * Optional className for container
   */
  className?: string;
};

/**
 * Base Empty State Component
 * Consistent pattern for all empty states with illustration, copy, and CTAs
 */
export function EmptyStateBase({
  illustration,
  title,
  description,
  primaryActionLabel,
  primaryActionHref,
  secondaryActionLabel,
  secondaryActionHref,
  className,
}: EmptyStateBaseProps) {
  return (
    <Card
      className={cn(
        "border-dashed border-border/80 bg-card/75 p-8",
        className
      )}
      role="status"
      aria-label={title}
    >
      <div className="mx-auto max-w-xl">
        {/* Illustration */}
        <div className="mb-6 flex justify-center" aria-hidden="true">
          {illustration}
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href={primaryActionHref}>{primaryActionLabel}</Link>
          </Button>

          {secondaryActionLabel && secondaryActionHref ? (
            <Button asChild variant="ghost" size="lg">
              <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
