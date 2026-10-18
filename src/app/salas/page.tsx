import type { Metadata } from "next";
import { Suspense } from "react";
import { parseRoomFilters } from "@/features/rooms/filters";
import { listResources, listRooms } from "@/features/rooms/queries";
import { RoomFiltersForm } from "@/features/rooms/components/room-filters-form";
import { RoomList } from "@/features/rooms/components/room-list";

export const metadata: Metadata = {
  title: "Salas",
};

export default function SalasPage({ searchParams }: PageProps<"/salas">) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Salas</h1>
        <p className="text-muted-foreground">Encontre uma sala pela capacidade e pelos recursos.</p>
      </div>

      {/* Lê a URL e o banco a cada requisição: fica dentro do Suspense (Cache Components). */}
      <Suspense fallback={<p className="text-muted-foreground">Carregando salas...</p>}>
        <RoomsSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function RoomsSection({ searchParams }: Pick<PageProps<"/salas">, "searchParams">) {
  const filters = parseRoomFilters(await searchParams);
  const [resources, rooms] = await Promise.all([listResources(), listRooms(filters)]);

  return (
    <>
      {/* key: remonta o formulário quando a URL muda, para os campos refletirem os filtros. */}
      <RoomFiltersForm key={JSON.stringify(filters)} filters={filters} resources={resources} />
      <RoomList rooms={rooms} />
    </>
  );
}
