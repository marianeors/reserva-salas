import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireAdmin } from "@/features/auth/session";
import { RoomForm } from "@/features/rooms/components/room-form";
import { getRoomForEdit, listResources } from "@/features/rooms/queries";

export const metadata: Metadata = {
  title: "Admin · Editar sala",
};

export default function EditarSalaPage({ params }: PageProps<"/admin/salas/[id]/editar">) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Editar sala</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
        <EditRoomForm params={params} />
      </Suspense>
    </div>
  );
}

async function EditRoomForm({ params }: Pick<PageProps<"/admin/salas/[id]/editar">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const [room, resources] = await Promise.all([getRoomForEdit(id), listResources()]);
  if (!room) notFound();

  return <RoomForm room={room} resources={resources} />;
}
