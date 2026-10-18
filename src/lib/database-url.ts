// Padrão para desenvolvimento local: o projeto sobe sem precisar criar um .env.
// Em outros ambientes, DATABASE_URL é definida externamente.
export const DEFAULT_DATABASE_URL = "file:./dev.db";

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
}
