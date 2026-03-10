import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface VehicleData {
  plate: string;
  make?: string | null;
  model?: string | null;
  year?: number | null;
  fuelType?: string | null;
  odometerKm?: number | null;
  status: string;
}

interface Deadline {
  type: string;
  dueDate: Date;
  amount?: number | null;
}

interface Refuel {
  date: Date;
  liters?: number | null;
  amountEur: number;
  odometerKm: number;
  fuelType: string;
}

interface Expense {
  date: Date;
  category: string;
  amountEur: number;
  description?: string | null;
  odometerKm?: number | null;
}

const FUEL_LABELS: Record<string, string> = {
  BENZINA: "Benzina",
  DIESEL: "Diesel",
  GPL: "GPL",
  METANO: "Metano",
  ELETTRICO: "Elettrico",
  IBRIDO_BENZINA: "Ibrido Benzina",
  IBRIDO_DIESEL: "Ibrido Diesel",
};

const CATEGORY_LABELS: Record<string, string> = {
  RIFORNIMENTO: "Rifornimento",
  MANUTENZIONE: "Manutenzione",
  ASSICURAZIONE: "Assicurazione",
  BOLLO: "Bollo",
  MULTA: "Multa",
  PARCHEGGIO: "Parcheggio",
  LAVAGGIO: "Lavaggio",
  PEDAGGI: "Pedaggi",
  ALTRO: "Altro",
};

export function generateVehiclePDF(
  vehicle: VehicleData,
  deadlines: Deadline[],
  refuels: Refuel[],
  expenses: Expense[]
) {
  const doc = new jsPDF();
  let yPos = 20;

  // Titolo
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Storico Veicolo", 105, yPos, { align: "center" });

  yPos += 15;

  // Dati veicolo
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Dati Veicolo", 14, yPos);

  yPos += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Targa: ${vehicle.plate}`, 14, yPos);
  yPos += 5;
  if (vehicle.make || vehicle.model) {
    doc.text(`Veicolo: ${vehicle.make || ""} ${vehicle.model || ""}`.trim(), 14, yPos);
    yPos += 5;
  }
  if (vehicle.year) {
    doc.text(`Anno: ${vehicle.year}`, 14, yPos);
    yPos += 5;
  }
  if (vehicle.fuelType) {
    doc.text(`Alimentazione: ${FUEL_LABELS[vehicle.fuelType] || vehicle.fuelType}`, 14, yPos);
    yPos += 5;
  }
  if (vehicle.odometerKm) {
    doc.text(`Chilometraggio: ${vehicle.odometerKm.toLocaleString("it-IT")} km`, 14, yPos);
    yPos += 5;
  }
  doc.text(`Stato: ${vehicle.status}`, 14, yPos);
  yPos += 10;

  // Scadenze
  if (deadlines.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Scadenze", 14, yPos);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [["Tipo", "Data Scadenza", "Importo"]],
      body: deadlines.map((d) => [
        d.type,
        format(d.dueDate, "dd/MM/yyyy", { locale: it }),
        d.amount ? `€${d.amount.toFixed(2)}` : "-",
      ]),
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Rifornimenti
  if (refuels.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Rifornimenti", 14, yPos);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [["Data", "Litri", "Importo", "Km", "Carburante"]],
      body: refuels.map((r) => [
        format(r.date, "dd/MM/yyyy", { locale: it }),
        r.liters ? r.liters.toFixed(1) : "-",
        `€${r.amountEur.toFixed(2)}`,
        r.odometerKm.toLocaleString("it-IT"),
        FUEL_LABELS[r.fuelType] || r.fuelType,
      ]),
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Spese
  if (expenses.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Spese", 14, yPos);
    yPos += 7;

    autoTable(doc, {
      startY: yPos,
      head: [["Data", "Categoria", "Descrizione", "Importo", "Km"]],
      body: expenses.map((e) => [
        format(e.date, "dd/MM/yyyy", { locale: it }),
        CATEGORY_LABELS[e.category] || e.category,
        e.description || "-",
        `€${e.amountEur.toFixed(2)}`,
        e.odometerKm ? e.odometerKm.toLocaleString("it-IT") : "-",
      ]),
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Riepilogo totali
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  const totalRefuels = refuels.reduce((sum, r) => sum + r.amountEur, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amountEur, 0);
  const grandTotal = totalRefuels + totalExpenses;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Riepilogo Finanziario", 14, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Totale rifornimenti: €${totalRefuels.toFixed(2)}`, 14, yPos);
  yPos += 5;
  doc.text(`Totale spese: €${totalExpenses.toFixed(2)}`, 14, yPos);
  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.text(`Totale complessivo: €${grandTotal.toFixed(2)}`, 14, yPos);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generato il ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: it })} - Pagina ${i} di ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }

  return doc;
}
