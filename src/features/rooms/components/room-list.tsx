import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { formatDuration } from "@/features/bookings/time";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
              <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" aria-hidden />
                  Até {room.capacity} pessoas
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" aria-hidden />
                  Reservas de até {formatDuration(room.maxDurationMinutes)}
                </span>
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
            <CardFooter>
              <Link href={`/salas/${room.id}`} className={buttonVariants({ size: "sm" })}>
                Reservar
              </Link>
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
}
