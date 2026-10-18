import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { requireUser } from "@/features/auth/session";
import { UserBookingList } from "@/features/bookings/components/user-booking-list";
import { listUserBookings } from "@/features/bookings/queries";

export const metadata: Metadata = {
  title: "Minhas reservas",
};

export default function MinhasReservasPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Minhas reservas</h1>

      {/* Lê o cookie, o relógio e o banco: fica dentro do Suspense (Cache Components). */}
      <Suspense fallback={<p className="text-muted-foreground">Carregando reservas...</p>}>
        <MyBookings />
      </Suspense>
    </div>
  );
}

async function MyBookings() {
  const user = await requireUser(); // sem login, redireciona para /entrar
  await connection();
  const now = new Date();
  const { upcoming, history } = await listUserBookings(user.id, now);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Próximas</h2>
        <UserBookingList bookings={upcoming} now={now} emptyMessage="Você não tem reservas futuras." />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Histórico</h2>
        <UserBookingList bookings={history} now={now} emptyMessage="Nenhuma reserva passada ou cancelada." />
      </section>
    </>
  );
}
