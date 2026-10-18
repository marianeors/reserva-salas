import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/features/auth/session";
import { RoomForm } from "@/features/rooms/components/room-form";
import { listResources } from "@/features/rooms/queries";

export const metadata: Metadata = {
  title: "Admin · Nova sala",
};

export default function NovaSalaPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Nova sala</h1>
      <Suspense fallback={<p className="text-muted-foreground">Carregando...</p>}>
        <NewRoomForm />
      </Suspense>
    </div>
  );
}

async function NewRoomForm() {
  await requireAdmin();
  const resources = await listResources();
  return <RoomForm resources={resources} />;
}
