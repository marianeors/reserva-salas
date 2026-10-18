// Data Access Layer de reservas.
import "server-only";
import { db } from "@/lib/db";
import {
  canCancelBooking,
  validateBooking,
  type BookingRuleViolation,
  type CancelViolation,
  type TimeRange,
} from "./rules";

export async function listUpcomingRoomBookings(roomId: string, now: Date) {
  const bookings = await db.booking.findMany({
    where: { roomId, status: "ACTIVE", endsAt: { gt: now } },
    select: { id: true, startsAt: true, endsAt: true, user: { select: { name: true } } },
    orderBy: { startsAt: "asc" },
  });

  return bookings.map(({ user, ...booking }) => ({ ...booking, userName: user.name }));
}

type CreateBookingInput = {
  userId: string;
  roomId: string;
  booking: TimeRange;
  now: Date;
};

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; reason: BookingRuleViolation | "ROOM_NOT_FOUND" };

// Checagem de sobreposição e inserção na MESMA transação: duas requisições
// simultâneas não conseguem reservar o mesmo horário.
export async function createBookingIfAvailable({
  userId,
  roomId,
  booking,
  now,
}: CreateBookingInput): Promise<CreateBookingResult> {
  return db.$transaction(async (tx) => {
    const room = await tx.room.findFirst({ where: { id: roomId, isActive: true }, select: { id: true } });
    if (!room) return { ok: false, reason: "ROOM_NOT_FOUND" };

    // Só reservas ativas que ainda não terminaram quando a nova começa;
    // a regra de sobreposição (função pura) decide se há conflito.
    const existing = await tx.booking.findMany({
      where: { roomId, status: "ACTIVE", endsAt: { gt: booking.startsAt } },
      select: { startsAt: true, endsAt: true },
    });

    const violation = validateBooking({ booking, now, existing });
    if (violation) return { ok: false, reason: violation };

    const created = await tx.booking.create({
      data: { roomId, userId, startsAt: booking.startsAt, endsAt: booking.endsAt },
      select: { id: true },
    });
    return { ok: true, bookingId: created.id };
  });
}

// Sempre filtra pelo usuário logado: não existe forma de listar reservas de outra pessoa.
export async function listUserBookings(userId: string, now: Date) {
  const bookings = await db.booking.findMany({
    where: { userId },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      status: true,
      room: { select: { id: true, name: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  const items = bookings.map(({ room, ...booking }) => ({
    ...booking,
    roomId: room.id,
    roomName: room.name,
    // Mesma regra usada no cancelamento: o botão só aparece quando é permitido.
    canCancel: canCancelBooking({ booking: { ...booking, userId }, userId, now }) === null,
  }));
  const isUpcoming = (b: (typeof items)[number]) => b.status === "ACTIVE" && b.endsAt > now;

  return {
    upcoming: items.filter(isUpcoming),
    // Histórico: mais recentes primeiro.
    history: items.filter((b) => !isUpcoming(b)).reverse(),
  };
}

export type UserBooking = Awaited<ReturnType<typeof listUserBookings>>["upcoming"][number];

export type CancelBookingResult = { ok: true } | { ok: false; reason: CancelViolation | "NOT_FOUND" };

export async function cancelBookingIfAllowed({
  bookingId,
  userId,
  now,
}: {
  bookingId: string;
  userId: string;
  now: Date;
}): Promise<CancelBookingResult> {
  return db.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true, status: true, startsAt: true },
    });
    if (!booking) return { ok: false, reason: "NOT_FOUND" };

    const violation = canCancelBooking({ booking, userId, now });
    if (violation) return { ok: false, reason: violation };

    // Cancelar não apaga: muda o status e libera o horário.
    await tx.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED", cancelledAt: now } });
    return { ok: true };
  });
}
