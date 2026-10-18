// Logs estruturados: uma linha JSON por evento na saída padrão.
// Em produção (ex.: CloudWatch Logs) cada campo vira filtrável sem parser extra.
// Regra: registrar apenas IDs e metadados, nunca dados pessoais (nome, e-mail).

type LogLevel = "info" | "warn" | "error";
type LogFields = Record<string, string | number | boolean | null | undefined>;

function write(level: LogLevel, event: string, fields: LogFields = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...fields });

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (event: string, fields?: LogFields) => write("info", event, fields),
  warn: (event: string, fields?: LogFields) => write("warn", event, fields),
  error: (event: string, fields?: LogFields) => write("error", event, fields),
};
