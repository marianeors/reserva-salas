"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/features/auth/session";
import { logger } from "@/lib/logger";
import { createBookingIfAvailable } from "./queries";
import { violationMessages } from "./rules";
import { formatDate, formatTime, minutesBetween, toUtcDate } from "./time";

const bookingFormSchema = z.object({
  roomId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

type BookingFormValues = { date: string; startTime: string; endTime: string };

export type BookingFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; values?: BookingFormValues };

export async function createBooking(_prev: BookingFormState, formData: FormData): Promise<BookingFormState> {
  // Quem está reservando vem do cookie, lido no servidor, nunca do formulário.
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Entre para fazer uma reserva." };

  const parsed = bookingFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: "Preencha a data, o início e o fim." };

  const { roomId, date, startTime, endTime } = parsed.data;
  const booking = { startsAt: toUtcDate(date, startTime), endsAt: toUtcDate(date, endTime) };

  // Datas inexistentes (ex.: 31/02) param aqui, antes de chegar ao banco.
  if (Number.isNaN(booking.startsAt.getTime()) || Number.isNaN(booking.endsAt.getTime())) {
    logger.warn("booking.rejected", { reason: "INVALID_DATE", roomId, userId: user.id });
    return { status: "error", message: "Data ou horário inválido.", values: { date, startTime, endTime } };
  }

  const result = await createBookingIfAvailable({ userId: user.id, roomId, booking, now: new Date() });

  if (!result.ok) {
    logger.warn("booking.rejected", { reason: result.reason, roomId, userId: user.id });
    const message =
      result.reason === "ROOM_NOT_FOUND" ? "Sala não encontrada." : violationMessages[result.reason];
    return { status: "error", message, values: { date, startTime, endTime } };
  }

  logger.info("booking.created", {
    bookingId: result.bookingId,
    roomId,
    userId: user.id,
    durationMin: minutesBetween(booking.startsAt, booking.endsAt),
  });

  // Atualiza a página para a nova reserva aparecer na lista.
  refresh();
  return {
    status: "success",
    message: `Reserva confirmada: ${formatDate(booking.startsAt)}, das ${formatTime(booking.startsAt)} às ${formatTime(booking.endsAt)}.`,
  };
}
