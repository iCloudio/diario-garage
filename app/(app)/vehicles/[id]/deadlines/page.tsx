import { redirect } from "next/navigation";

export default async function VehicleDeadlinesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/vehicles/${id}`);
}
