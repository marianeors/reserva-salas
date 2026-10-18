// Data Access Layer: único ponto de acesso ao banco para salas.
// "server-only" faz o build falhar se este arquivo for importado no navegador.
import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { RoomFilters } from "./filters";
import type { RoomFormData } from "./room-form";

export async function listRooms({ minCapacity, resources }: RoomFilters) {
  const rooms = await db.room.findMany({
    where: {
      isActive: true,
      capacity: minCapacity ? { gte: minCapacity } : undefined,
      // A sala precisa ter TODOS os recursos selecionados.
      AND: resources.map((name) => ({ resources: { some: { resource: { name } } } })),
    },
    include: { resources: { include: { resource: true } } },
    orderBy: [{ capacity: "asc" }, { name: "asc" }],
  });

  return rooms.map((room) => ({
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    maxDurationMinutes: room.maxDurationMinutes,
    resources: room.resources.map(({ resource }) => resource.name).sort(),
  }));
}

export type RoomListItem = Awaited<ReturnType<typeof listRooms>>[number];

export async function getActiveRoom(id: string) {
  const room = await db.room.findFirst({
    where: { id, isActive: true },
    include: { resources: { include: { resource: true } } },
  });
  if (!room) return null;

  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    maxDurationMinutes: room.maxDurationMinutes,
    resources: room.resources.map(({ resource }) => resource.name).sort(),
  };
}

export async function listResources() {
  return db.resource.findMany({ orderBy: { name: "asc" } });
}

// --- Admin ---
// Estas funções não checam permissão sozinhas: quem chama (páginas com
// requireAdmin e Server Actions com isAdmin) garante que é um admin.

export async function listRoomsForAdmin() {
  const rooms = await db.room.findMany({
    include: { resources: { include: { resource: true } } },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return rooms.map((room) => ({
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    maxDurationMinutes: room.maxDurationMinutes,
    isActive: room.isActive,
    resources: room.resources.map(({ resource }) => resource.name).sort(),
  }));
}

export async function getRoomForEdit(id: string) {
  const room = await db.room.findUnique({ where: { id }, include: { resources: true } });
  if (!room) return null;

  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    maxDurationMinutes: room.maxDurationMinutes,
    isActive: room.isActive,
    resourceIds: room.resources.map(({ resourceId }) => resourceId),
  };
}

export type SaveRoomResult = { ok: true; roomId: string } | { ok: false; reason: "DUPLICATE_NAME" | "NOT_FOUND" };

// Cria (sem id) ou atualiza (com id) uma sala e substitui seus recursos.
export async function saveRoom(id: string | undefined, data: RoomFormData): Promise<SaveRoomResult> {
  const { resourceIds, ...fields } = data;
  const resources = { create: resourceIds.map((resourceId) => ({ resourceId })) };

  try {
    if (!id) {
      const room = await db.room.create({ data: { ...fields, resources }, select: { id: true } });
      return { ok: true, roomId: room.id };
    }

    const room = await db.room.update({
      where: { id },
      data: { ...fields, resources: { deleteMany: {}, ...resources } },
      select: { id: true },
    });
    return { ok: true, roomId: room.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return { ok: false, reason: "DUPLICATE_NAME" }; // nome único
      if (error.code === "P2025") return { ok: false, reason: "NOT_FOUND" }; // sala não existe
    }
    throw error;
  }
}
