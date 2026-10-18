// Data Access Layer de reservas.
import "server-only";
import { db } from "@/lib/db";
import { validateBooking, type BookingRuleViolation, type TimeRange } from "./rules";

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
