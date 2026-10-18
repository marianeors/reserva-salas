import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoomListItem } from "../queries";

export function RoomList({ rooms }: { rooms: RoomListItem[] }) {
  if (rooms.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        Nenhuma sala encontrada com esses filtros.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <li key={room.id}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <Users className="size-4" aria-hidden />
                Até {room.capacity} pessoas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {room.resources.length > 0 ? (
                room.resources.map((name) => (
                  <Badge key={name} variant="secondary">
                    {name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Sem recursos</span>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
