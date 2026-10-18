import { formatDate, formatTime } from "../time";

type Booking = { id: string; startsAt: Date; endsAt: Date; userName: string };

export function RoomBookings({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma reserva futura. A sala está livre.</p>;
  }

  return (
    <ul className="flex flex-col divide-y rounded-xl border">
      {bookings.map((booking) => (
        <li key={booking.id} className="flex flex-wrap justify-between gap-2 px-4 py-2 text-sm">
          <span>
            {formatDate(booking.startsAt)} · {formatTime(booking.startsAt)}–{formatTime(booking.endsAt)}
          </span>
          <span className="text-muted-foreground">{booking.userName}</span>
        </li>
      ))}
    </ul>
  );
}
