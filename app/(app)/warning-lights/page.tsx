import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPrimaryVehicle } from "@/lib/vehicles";

export default async function WarningLightsRedirect() {
  const user = await requireUser();
  const vehicle = await getPrimaryVehicle(user.id);
  if (!vehicle) redirect("/vehicles");
  redirect(`/vehicles/${vehicle.id}/warning-lights`);
}
