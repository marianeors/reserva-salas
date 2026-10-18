import { z } from "zod";

// Filtros da listagem de salas, lidos da URL:
// /salas?capacidade=8&recurso=Projetor&recurso=TV
export type RoomFilters = {
  minCapacity?: number;
  resources: string[];
};

type SearchParams = Record<string, string | string[] | undefined>;

// Valores inválidos na URL são ignorados (em vez de quebrar a página),
// já que qualquer pessoa pode editar o link à mão.
const capacitySchema = z.coerce.number().int().min(1).optional().catch(undefined);

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseRoomFilters(params: SearchParams): RoomFilters {
  const minCapacity = params.capacidade ? capacitySchema.parse(params.capacidade) : undefined;

  const resources = toArray(params.recurso)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

  return { minCapacity, resources: [...new Set(resources)] };
}
