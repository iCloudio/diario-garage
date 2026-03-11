import { redirect } from "next/navigation";

export default async function VehicleExpensesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/vehicles/${id}`);
}
