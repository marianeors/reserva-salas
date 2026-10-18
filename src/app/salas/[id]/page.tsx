import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/session";
import { BookingForm } from "@/features/bookings/components/booking-form";
import { RoomBookings } from "@/features/bookings/components/room-bookings";
import { listUpcomingRoomBookings } from "@/features/bookings/queries";
import { formatDuration, todayInputValue } from "@/features/bookings/time";
import { getActiveRoom } from "@/features/rooms/queries";

export default function SalaPage({ params }: PageProps<"/salas/[id]">) {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/salas" className="text-sm text-muted-foreground hover:text-foreground">
        ← Voltar para salas
      </Link>

      {/* Lê a URL, o cookie, o relógio e o banco: fica dentro do Suspense (Cache Components). */}
      <Suspense fallback={<p className="text-muted-foreground">Carregando sala...</p>}>
        <RoomDetails params={params} />
      </Suspense>
    </div>
  );
}

async function RoomDetails({ params }: Pick<PageProps<"/salas/[id]">, "params">) {
  const { id } = await params;
  await connection(); // usa a hora atual: renderiza a cada requisição
  const now = new Date();

  const [room, user, bookings] = await Promise.all([
    getActiveRoom(id),
    getCurrentUser(),
    listUpcomingRoomBookings(id, now),
  ]);
  if (!room) notFound();

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{room.name}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-4" aria-hidden />
            Até {room.capacity} pessoas
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden />
            Reservas de até {formatDuration(room.maxDurationMinutes)}
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {room.resources.map((name) => (
            <Badge key={name} variant="secondary">
              {name}
            </Badge>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Reservar</h2>
        {user ? (
          <BookingForm roomId={room.id} today={todayInputValue(now)} />
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/entrar" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Entrar
            </Link>{" "}
            para reservar esta sala.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Próximas reservas</h2>
        <RoomBookings bookings={bookings} />
      </section>
    </>
  );
}
