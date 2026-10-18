import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { UserBooking } from "../queries";
import { formatDate, formatTime } from "../time";
import { CancelBookingButton } from "./cancel-booking-button";

type Props = {
  bookings: UserBooking[];
  emptyMessage: string;
  now: Date;
};

function statusLabel(booking: UserBooking, now: Date) {
  if (booking.status === "CANCELLED") return { text: "Cancelada", variant: "destructive" as const };
  if (booking.endsAt <= now) return { text: "Concluída", variant: "secondary" as const };
  return { text: "Em andamento", variant: "outline" as const };
}

export function UserBookingList({ bookings, emptyMessage, now }: Props) {
  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col divide-y rounded-xl border">
      {bookings.map((booking) => {
        const label = statusLabel(booking, now);
        return (
          <li key={booking.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <Link href={`/salas/${booking.roomId}`} className="font-medium hover:underline">
                {booking.roomName}
              </Link>
              <span className="text-sm text-muted-foreground">
                {formatDate(booking.startsAt)} · {formatTime(booking.startsAt)}–{formatTime(booking.endsAt)}
              </span>
            </div>

            {booking.canCancel ? (
              <CancelBookingButton bookingId={booking.id} />
            ) : (
              <Badge variant={label.variant}>{label.text}</Badge>
            )}
          </li>
        );
      })}
    </ul>
  );
}
