"use client";

import { useEffect } from "react";
import { X, CheckCircle2, Circle, Car, Calendar, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/use-onboarding";
import { cn } from "@/lib/utils";

type WelcomeChecklistProps = {
  hasVehicles: boolean;
  hasDeadlines: boolean;
  hasExpensesOrRefuels: boolean;
};

export function WelcomeChecklist({
  hasVehicles,
  hasDeadlines,
  hasExpensesOrRefuels,
}: WelcomeChecklistProps) {
  const {
    shouldShow,
    progress,
    isStepCompleted,
    dismiss,
    completeStep,
  } = useOnboarding(hasVehicles);

  // Auto-complete steps based on data
  useEffect(() => {
    if (hasVehicles && !isStepCompleted("vehicle")) {
      completeStep("vehicle");
    }
    if (hasDeadlines && !isStepCompleted("deadlines")) {
      completeStep("deadlines");
    }
    if (hasExpensesOrRefuels && !isStepCompleted("expense")) {
      completeStep("expense");
    }
  }, [hasVehicles, hasDeadlines, hasExpensesOrRefuels, isStepCompleted, completeStep]);

  // Don't render if dismissed or hydration not complete
  if (!shouldShow) return null;

  const steps = [
    {
      id: "vehicle" as const,
      icon: Car,
      title: "Aggiungi il tuo primo veicolo",
      description: "Inizia inserendo targa e dati del mezzo",
      completed: isStepCompleted("vehicle"),
    },
    {
      id: "deadlines" as const,
      icon: Calendar,
      title: "Imposta le scadenze importanti",
      description: "Bollo, assicurazione e revisione",
      completed: isStepCompleted("deadlines"),
    },
    {
      id: "expense" as const,
      icon: DollarSign,
      title: "Registra spese e rifornimenti",
      description: "Tieni traccia dei costi del veicolo",
      completed: isStepCompleted("expense"),
    },
  ];

  return (
    <Card
      className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
      role="region"
      aria-label="Welcome onboarding"
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-8 w-8 p-0"
        onClick={dismiss}
        aria-label="Chiudi onboarding"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          👋 Benvenuto nel tuo garage digitale!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Inizia in 3 semplici passi per tenere tutto sotto controllo
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Completamento</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const StepIcon = step.completed ? CheckCircle2 : Circle;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 transition-all",
                step.completed
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/50 bg-background/50"
              )}
            >
              {/* Step icon */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  step.completed
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Step content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "font-medium",
                      step.completed && "text-primary"
                    )}
                  >
                    {step.title}
                  </p>
                  <StepIcon
                    className={cn(
                      "h-4 w-4",
                      step.completed
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                    aria-label={step.completed ? "Completato" : "Da completare"}
                  />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      {progress === 100 ? (
        <div className="mt-6 rounded-lg border border-primary/30 bg-primary/10 p-4 text-center">
          <p className="text-sm font-medium text-primary">
            🎉 Ottimo lavoro! Hai completato la configurazione iniziale.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-primary hover:bg-primary/10"
            onClick={dismiss}
          >
            Chiudi questo messaggio
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
