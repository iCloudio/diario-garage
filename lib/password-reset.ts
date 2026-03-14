import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const PASSWORD_RESET_HOURS = 2;

function addHours(date: Date, hours: number) {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildBaseUrl(request?: Request) {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (!request) return "http://localhost:3000";

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function createPasswordResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(token);
  const expiresAt = addHours(new Date(), PASSWORD_RESET_HOURS);

  await db.passwordResetToken.deleteMany({
    where: {
      userId,
    },
  });

  await db.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export function buildPasswordResetUrl(token: string, request?: Request) {
  const baseUrl = buildBaseUrl(request);
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function resetPasswordWithToken(token: string, password: string) {
  const tokenHash = hashResetToken(token);
  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db.$transaction(async (tx) => {
    const resetToken = await tx.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
        user: { deletedAt: null },
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!resetToken) {
      return null;
    }

    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: now },
    });

    await tx.session.deleteMany({
      where: { userId: resetToken.userId },
    });

    return {
      userId: resetToken.userId,
    };
  });

  return result;
}
