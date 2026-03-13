"use client";

import { useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VehicleSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isSearching?: boolean;
  placeholder?: string;
  className?: string;
};

/**
 * Vehicle Search Bar
 * Search input with debounce indicator and clear button
 */
export function VehicleSearchBar({
  value,
  onChange,
  onClear,
  isSearching = false,
  placeholder = "Cerca veicolo per targa, marca o modello...",
  className,
}: VehicleSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not in an input/textarea
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <Input
        ref={inputRef}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 pl-9 pr-9"
        aria-label="Cerca veicoli"
      />

      {value && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onClear}
            aria-label="Cancella ricerca"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="mt-1 text-xs text-muted-foreground">
        Premi <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">/</kbd>{" "}
        per cercare
      </p>
    </div>
  );
}
