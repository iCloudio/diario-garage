import { db } from "@/lib/db";

export async function getPrimaryVehicle(userId: string) {
  return db.vehicle.findFirst({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}
