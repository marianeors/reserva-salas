// Login fake: o cookie guarda apenas o ID do usuário escolhido em "Entrar como".
// Não há senha nem assinatura (o desafio dispensa login real), mas toda
// permissão é decidida aqui no servidor, a partir do usuário lido do banco.
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { Role } from "@/generated/prisma/client";
import { db } from "@/lib/db";

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

export async function listUsersForSignIn() {
  return db.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}
