import { describe, expect, it } from "vitest";
import { parseRoomFilters } from "@/features/rooms/filters";

describe("parseRoomFilters", () => {
  it("retorna filtros vazios quando a URL não tem parâmetros", () => {
    expect(parseRoomFilters({})).toEqual({ minCapacity: undefined, resources: [] });
  });

  it("lê a capacidade mínima como número", () => {
    expect(parseRoomFilters({ capacidade: "8" }).minCapacity).toBe(8);
  });

  it.each(["abc", "0", "-3", "2.5", ""])("ignora capacidade inválida (%j)", (capacidade) => {
    expect(parseRoomFilters({ capacidade }).minCapacity).toBeUndefined();
  });

  it("aceita um ou vários recursos", () => {
    expect(parseRoomFilters({ recurso: "Projetor" }).resources).toEqual(["Projetor"]);
    expect(parseRoomFilters({ recurso: ["Projetor", "TV"] }).resources).toEqual(["Projetor", "TV"]);
  });

  it("descarta recursos vazios e repetidos", () => {
    expect(parseRoomFilters({ recurso: ["TV", " ", "TV"] }).resources).toEqual(["TV"]);
  });
});
