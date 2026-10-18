"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { SESSION_COOKIE } from "./session";

export async function signIn(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");

  // Não confia no valor enviado pelo navegador: o usuário precisa existir.
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) redirect("/entrar");

  (await cookies()).set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  logger.info("auth.signed_in", { userId: user.id });

  redirect("/salas");
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/entrar");
}
