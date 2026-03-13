import { EmptyStateBase } from "./empty-state-base";

type EmptyRefuelsProps = {
  vehicleId: string;
};

/**
 * Empty Refuels Illustration
 * Simple inline SVG for empty refuels list
 */
function RefuelIllustration() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground/30"
    >
      {/* Gas pump */}
      <rect
        x="70"
        y="40"
        width="60"
        height="80"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Pump display */}
      <rect
        x="80"
        y="55"
        width="40"
        height="25"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        opacity="0.1"
      />

      {/* Pump nozzle */}
      <path
        d="M130 75 L145 75 L145 95 L155 95"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="160" cy="95" r="5" fill="currentColor" />

      {/* Fuel drops */}
      <g opacity="0.3">
        <path
          d="M85 140 Q85 150 90 150 Q95 150 95 140 L92.5 135 Q90 130 87.5 135 Z"
          fill="currentColor"
        />
        <path
          d="M105 145 Q105 153 109 153 Q113 153 113 145 L110.5 141 Q109 137 107.5 141 Z"
          fill="currentColor"
        />
      </g>

      {/* Plus icon */}
      <circle cx="100" cy="70" r="15" fill="currentColor" opacity="0.1" />
      <line
        x1="100"
        y1="63"
        x2="100"
        y2="77"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="93"
        y1="70"
        x2="107"
        y2="70"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Empty Refuels State
 * Displayed when vehicle has no refuels recorded
 */
export function EmptyRefuels({ vehicleId }: EmptyRefuelsProps) {
  return (
    <EmptyStateBase
      illustration={<RefuelIllustration />}
      title="Nessun rifornimento registrato"
      description="Registra i rifornimenti per monitorare i consumi, calcolare i km/l e tenere traccia delle spese per il carburante nel tempo."
      primaryActionLabel="Registra primo rifornimento"
      primaryActionHref={`/vehicles/${vehicleId}/refuels/new`}
    />
  );
}
