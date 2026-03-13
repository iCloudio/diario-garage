"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary per catturare errori React runtime
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[React Error Boundary]", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <Card className="max-w-md border-destructive/50 bg-destructive/5 p-8">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <h2 className="mt-4 text-xl font-semibold">Si è verificato un errore</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {process.env.NODE_ENV === "development" && this.state.error
                  ? this.state.error.message
                  : "Qualcosa è andato storto. Riprova o ricarica la pagina."}
              </p>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="mt-6"
              >
                Ricarica pagina
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper semplificato per sezioni specifiche
 */
export function ErrorSection({ children, sectionName }: { children: ReactNode; sectionName?: string }) {
  return (
    <ErrorBoundary
      fallback={
        <Card className="border-destructive/50 bg-destructive/5 p-6">
          <div className="flex items-center gap-3 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>
              Errore nel caricamento{sectionName ? ` di ${sectionName}` : ""}. Riprova più tardi.
            </span>
          </div>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
