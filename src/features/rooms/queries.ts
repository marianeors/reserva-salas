import { db } from "@/lib/db";
import type { RoomFilters } from "./filters";

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
    resources: room.resources.map(({ resource }) => resource.name).sort(),
  }));
}

export type RoomListItem = Awaited<ReturnType<typeof listRooms>>[number];

export async function listResources() {
  return db.resource.findMany({ orderBy: { name: "asc" } });
}
