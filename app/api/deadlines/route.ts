import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("dg_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  const session = await db.session.findUnique({ where: { id: token } });
  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Sessione scaduta." }, { status: 401 });
  }

  const deadlines = await db.deadline.findMany({
    where: {
      vehicle: {
        userId: session.userId,
        deletedAt: null,
      },
      deletedAt: null,
    },
    include: {
      vehicle: {
        select: { id: true, plate: true, make: true, model: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ deadlines });
}
