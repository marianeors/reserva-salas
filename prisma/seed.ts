// Seed idempotente: pode rodar várias vezes sem duplicar dados (upsert por
// campos únicos). As reservas de exemplo são validadas pelas mesmas regras
// da aplicação, então o seed nunca grava algo que o sistema recusaria.
import "dotenv/config";
import { validateBooking } from "../src/features/bookings/rules";
import { toUtcDate, todayInputValue } from "../src/features/bookings/time";
import { Role } from "../src/generated/prisma/client";
import { db } from "../src/lib/db";

const users = [
  { name: "Ana Souza", email: "ana@example.com", role: Role.USER },
  { name: "Bruno Lima", email: "bruno@example.com", role: Role.USER },
  { name: "Carla Mendes", email: "carla@example.com", role: Role.ADMIN },
];

const resources = ["Projetor", "TV", "Videoconferência", "Quadro branco"];

// maxDurationMinutes varia por sala (SALA-6): salas pequenas para reuniões
// rápidas, auditório para eventos longos.
const rooms = [
  { name: "Sala Aurora", capacity: 4, maxDurationMinutes: 60, isActive: true, resources: ["TV"] },
  {
    name: "Sala Brisa",
    capacity: 6,
    maxDurationMinutes: 120,
    isActive: true,
    resources: ["TV", "Quadro branco"],
  },
  {
    name: "Sala Cerrado",
    capacity: 8,
    maxDurationMinutes: 240,
    isActive: true,
    resources: ["Projetor", "Quadro branco"],
  },
  {
    name: "Sala Delta",
    capacity: 10,
    maxDurationMinutes: 240,
    isActive: true,
    resources: ["Projetor", "Videoconferência"],
  },
  {
    name: "Sala Estrela",
    capacity: 12,
    maxDurationMinutes: 180,
    isActive: true,
    resources: ["TV", "Videoconferência", "Quadro branco"],
  },
  {
    name: "Auditório Farol",
    capacity: 20,
    maxDurationMinutes: 480,
    isActive: true,
    resources: ["Projetor", "Videoconferência", "Quadro branco"],
  },
  // Desativada: demonstra que salas não são apagadas, apenas desativadas.
  {
    name: "Sala Gávea",
    capacity: 6,
    maxDurationMinutes: 240,
    isActive: false,
    resources: ["Quadro branco"],
  },
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
        maxDurationMinutes: room.maxDurationMinutes,
        isActive: room.isActive,
        resources: { deleteMany: {}, ...roomResources },
      },
      create: { ...room, resources: roomResources },
    });
  }

  await seedBookings();

  const [userCount, roomCount, resourceCount, bookingCount] = await Promise.all([
    db.user.count(),
    db.room.count(),
    db.resource.count(),
    db.booking.count({ where: { status: "ACTIVE" } }),
  ]);
  console.log(
    `Seed concluído: ${userCount} usuários, ${roomCount} salas, ${resourceCount} recursos, ${bookingCount} reservas ativas.`,
  );
}

// Reservas de exemplo no próximo dia útil (horário de Brasília), para a demo
// sempre mostrar reservas futuras, independentemente de quando o seed roda.
const sampleBookings = [
  { id: "seed-booking-1", email: "ana@example.com", room: "Sala Aurora", start: "09:00", end: "10:00" },
  { id: "seed-booking-2", email: "bruno@example.com", room: "Sala Delta", start: "10:00", end: "11:00" },
  { id: "seed-booking-3", email: "ana@example.com", room: "Auditório Farol", start: "11:00", end: "12:00" },
];

function nextBusinessDay(now: Date): string {
  // Meio-dia UTC evita que somar dias mude a data por causa do fuso.
  const day = new Date(`${todayInputValue(now)}T12:00:00Z`);
  do {
    day.setUTCDate(day.getUTCDate() + 1);
  } while (day.getUTCDay() === 0 || day.getUTCDay() === 6);
  return day.toISOString().slice(0, 10);
}

async function seedBookings() {
  const now = new Date();
  const date = nextBusinessDay(now);

  for (const sample of sampleBookings) {
    const user = await db.user.findUniqueOrThrow({ where: { email: sample.email } });
    const room = await db.room.findUniqueOrThrow({ where: { name: sample.room } });
    const booking = { startsAt: toUtcDate(date, sample.start), endsAt: toUtcDate(date, sample.end) };

    const existing = await db.booking.findMany({
      where: { roomId: room.id, status: "ACTIVE", id: { not: sample.id } },
      select: { startsAt: true, endsAt: true },
    });
    const violation = validateBooking({ booking, now, existing, maxDurationMinutes: room.maxDurationMinutes });
    // Não quebra o setup se alguém já reservou esse horário: só pula o exemplo.
    if (violation) {
      console.warn(`Reserva de exemplo ${sample.id} ignorada: ${violation}`);
      continue;
    }

    const data = { roomId: room.id, userId: user.id, ...booking, status: "ACTIVE" as const, cancelledAt: null };
    await db.booking.upsert({ where: { id: sample.id }, update: data, create: { id: sample.id, ...data } });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
