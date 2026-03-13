import { EmptyStateBase } from "./empty-state-base";

/**
 * Empty Vehicles Illustration
 * Simple inline SVG for empty vehicle list
 */
function VehicleIllustration() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground/30"
    >
      {/* Garage door */}
      <rect
        x="20"
        y="40"
        width="160"
        height="100"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeDasharray="8 4"
      />
      <line
        x1="100"
        y1="40"
        x2="100"
        y2="140"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="8 4"
      />

      {/* Car silhouette (faded) */}
      <g opacity="0.3">
        <ellipse cx="70" cy="120" rx="12" ry="12" fill="currentColor" />
        <ellipse cx="130" cy="120" rx="12" ry="12" fill="currentColor" />
        <path
          d="M50 120 L50 100 L60 85 L80 85 L90 70 L110 70 L120 85 L140 85 L150 100 L150 120"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Plus icon */}
      <circle cx="100" cy="90" r="20" fill="currentColor" opacity="0.1" />
      <line
        x1="100"
        y1="80"
        x2="100"
        y2="100"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="90"
        y1="90"
        x2="110"
        y2="90"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Empty Vehicles State
 * Displayed when user has no vehicles in their garage
 */
export function EmptyVehicles() {
  return (
    <EmptyStateBase
      illustration={<VehicleIllustration />}
      title="Il tuo garage è vuoto"
      description="Aggiungi il primo veicolo per iniziare a monitorare documenti, scadenze, spese e rifornimenti in un unico posto."
      primaryActionLabel="Aggiungi il primo veicolo"
      primaryActionHref="/vehicles/new"
    />
  );
}
