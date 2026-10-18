// Login fake: o cookie guarda apenas o ID do usuário escolhido em "Entrar como".
// Não há senha nem assinatura (o desafio dispensa login real), mas toda
// permissão é decidida aqui no servidor, a partir do usuário lido do banco.
import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { Role } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const SESSION_COOKIE = "reserva_user_id";

export type CurrentUser = {
  id: string;
  name: string;
  role: Role;
};

// cache(): várias leituras na mesma requisição consultam o banco uma vez só.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

export function isAdmin(user: CurrentUser | null): user is CurrentUser & { role: typeof Role.ADMIN } {
  return user?.role === Role.ADMIN;
}

// Para páginas do admin. Usuário comum recebe 404: a área nem "existe" para ele.
// Server Actions do admin fazem a própria checagem com isAdmin().
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!isAdmin(user)) {
    // Registrado durante a renderização: o Next pode renderizar a página mais
    // de uma vez por requisição, então este evento pode aparecer duplicado.
    logger.warn("admin.access_denied", { userId: user.id });
    notFound();
  }
  return user;
}

export async function listUsersForSignIn() {
  return db.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}
