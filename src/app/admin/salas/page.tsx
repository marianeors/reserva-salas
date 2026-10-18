import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/features/auth/session";
import { formatDuration } from "@/features/bookings/time";
import { listRoomsForAdmin } from "@/features/rooms/queries";

export const metadata: Metadata = {
  title: "Admin · Salas",
};

export default function AdminSalasPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Lê o cookie e o banco: fica dentro do Suspense (Cache Components). */}
      <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
        <AdminRooms />
      </Suspense>
    </div>
  );
}

async function AdminRooms() {
  await requireAdmin(); // sem login: /entrar; usuário comum: 404
  const rooms = await listRoomsForAdmin();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Gerenciar salas</h1>
        <Link href="/admin/salas/nova" className={buttonVariants()}>
          Nova sala
        </Link>
      </div>

      <ul className="flex flex-col divide-y rounded-xl border">
        {rooms.map((room) => (
          <li key={room.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 font-medium">
                {room.name}
                {!room.isActive && <Badge variant="outline">Desativada</Badge>}
              </span>
              <span className="text-sm text-muted-foreground">
                Até {room.capacity} pessoas · reservas de até {formatDuration(room.maxDurationMinutes)} ·{" "}
                {room.resources.join(", ") || "Sem recursos"}
              </span>
            </div>
            <Link
              href={`/admin/salas/${room.id}/editar`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Editar
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
