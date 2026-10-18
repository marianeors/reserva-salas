import { describe, expect, it } from "vitest";
import { readRoomForm, validateRoomForm, type RoomFormValues } from "@/features/rooms/room-form";

const valid: RoomFormValues = { name: "Sala Nova", capacity: "8", resourceIds: ["r1", "r2"], isActive: true };

describe("readRoomForm", () => {
  it("lê os campos do formulário, incluindo vários recursos e o checkbox", () => {
    const formData = new FormData();
    formData.append("name", "Sala Nova");
    formData.append("capacity", "8");
    formData.append("resourceIds", "r1");
    formData.append("resourceIds", "r2");
    formData.append("isActive", "on");

    expect(readRoomForm(formData)).toEqual(valid);
  });

  it("trata checkbox desmarcado (campo ausente) como sala desativada", () => {
    const formData = new FormData();
    formData.append("name", "Sala Nova");
    expect(readRoomForm(formData)).toMatchObject({ isActive: false, resourceIds: [] });
  });
});

describe("validateRoomForm", () => {
  it("aceita dados válidos e converte a capacidade para número", () => {
    const result = validateRoomForm(valid);
    expect(result).toEqual({ ok: true, data: { ...valid, capacity: 8 } });
  });

  it("remove espaços do nome", () => {
    const result = validateRoomForm({ ...valid, name: "  Sala Nova  " });
    expect(result.ok && result.data.name).toBe("Sala Nova");
  });

  it.each([
    [{ name: "A" }, "O nome precisa ter pelo menos 2 caracteres."],
    [{ name: "x".repeat(61) }, "O nome pode ter no máximo 60 caracteres."],
    [{ capacity: "0" }, "A capacidade mínima é 1 pessoa."],
    [{ capacity: "101" }, "A capacidade máxima é 100 pessoas."],
    [{ capacity: "2.5" }, "A capacidade precisa ser um número inteiro."],
  ])("rejeita %j", (override, message) => {
    expect(validateRoomForm({ ...valid, ...override })).toEqual({ ok: false, message });
  });
});
