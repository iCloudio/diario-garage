import { EmptyStateBase } from "./empty-state-base";

type EmptyExpensesProps = {
  vehicleId: string;
};

/**
 * Empty Expenses Illustration
 * Simple inline SVG for empty expenses list
 */
function ExpenseIllustration() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground/30"
    >
      {/* Receipt paper */}
      <rect
        x="60"
        y="30"
        width="80"
        height="110"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      {/* Receipt top tear */}
      <path
        d="M60 30 L65 35 L70 30 L75 35 L80 30 L85 35 L90 30 L95 35 L100 30 L105 35 L110 30 L115 35 L120 30 L125 35 L130 30 L135 35 L140 30"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Receipt lines (faded) */}
      <g opacity="0.3">
        <line x1="70" y1="55" x2="130" y2="55" stroke="currentColor" strokeWidth="2" />
        <line x1="70" y1="70" x2="110" y2="70" stroke="currentColor" strokeWidth="2" />
        <line x1="70" y1="85" x2="125" y2="85" stroke="currentColor" strokeWidth="2" />
        <line x1="70" y1="100" x2="105" y2="100" stroke="currentColor" strokeWidth="2" />
      </g>

      {/* Euro symbol */}
      <circle cx="100" cy="110" r="18" fill="currentColor" opacity="0.1" />
      <text
        x="100"
        y="120"
        textAnchor="middle"
        fontSize="24"
        fontWeight="bold"
        fill="currentColor"
      >
        €
      </text>
    </svg>
  );
}

/**
 * Empty Expenses State
 * Displayed when vehicle has no expenses recorded
 */
export function EmptyExpenses({ vehicleId }: EmptyExpensesProps) {
  return (
    <EmptyStateBase
      illustration={<ExpenseIllustration />}
      title="Nessuna spesa registrata"
      description="Inizia a tracciare le spese del veicolo: manutenzione, riparazioni, tagliandi e altro. Avrai sempre sotto controllo quanto spendi."
      primaryActionLabel="Registra prima spesa"
      primaryActionHref={`/vehicles/${vehicleId}/expenses/new`}
    />
  );
}
