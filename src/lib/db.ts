import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { getDatabaseUrl } from "./database-url";

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: getDatabaseUrl() });
  return new PrismaClient({ adapter });
}

// Em desenvolvimento o Next recarrega módulos a cada alteração; guardar a
// instância no globalThis evita abrir uma conexão nova a cada reload.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
