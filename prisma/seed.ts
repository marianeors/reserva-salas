// Seed idempotente: pode rodar várias vezes sem duplicar dados (upsert por
// campos únicos). Reservas de exemplo entram no SALA-2, validadas pelas
// regras de domínio.
import "dotenv/config";
import { Role } from "../src/generated/prisma/client";
import { db } from "../src/lib/db";

const users = [
  { name: "Ana Souza", email: "ana@example.com", role: Role.USER },
  { name: "Bruno Lima", email: "bruno@example.com", role: Role.USER },
  { name: "Carla Mendes", email: "carla@example.com", role: Role.ADMIN },
];

const resources = ["Projetor", "TV", "Videoconferência", "Quadro branco"];

const rooms = [
  { name: "Sala Aurora", capacity: 4, isActive: true, resources: ["TV"] },
  { name: "Sala Brisa", capacity: 6, isActive: true, resources: ["TV", "Quadro branco"] },
  { name: "Sala Cerrado", capacity: 8, isActive: true, resources: ["Projetor", "Quadro branco"] },
  { name: "Sala Delta", capacity: 10, isActive: true, resources: ["Projetor", "Videoconferência"] },
  {
    name: "Sala Estrela",
    capacity: 12,
    isActive: true,
    resources: ["TV", "Videoconferência", "Quadro branco"],
  },
  {
    name: "Auditório Farol",
    capacity: 20,
    isActive: true,
    resources: ["Projetor", "Videoconferência", "Quadro branco"],
  },
  // Desativada: demonstra que salas não são apagadas, apenas desativadas.
  { name: "Sala Gávea", capacity: 6, isActive: false, resources: ["Quadro branco"] },
];

async function main() {
  for (const user of users) {
    await db.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: user,
    });
  }

  for (const name of resources) {
    await db.resource.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const { resources: resourceNames, ...room } of rooms) {
    const roomResources = {
      create: resourceNames.map((name) => ({ resource: { connect: { name } } })),
    };

    await db.room.upsert({
      where: { name: room.name },
      update: {
        capacity: room.capacity,
        isActive: room.isActive,
        resources: { deleteMany: {}, ...roomResources },
      },
      create: { ...room, resources: roomResources },
    });
  }

  const [userCount, roomCount, resourceCount] = await Promise.all([
    db.user.count(),
    db.room.count(),
    db.resource.count(),
  ]);
  console.log(`Seed concluído: ${userCount} usuários, ${roomCount} salas, ${resourceCount} recursos.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
