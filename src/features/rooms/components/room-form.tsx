"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveRoomAction, type RoomFormState } from "../actions";
import { MAX_ROOM_CAPACITY, type RoomFormValues } from "../room-form";

type Props = {
  // Ausente = cadastro de sala nova.
  room?: { id: string } & Omit<RoomFormValues, "capacity"> & { capacity: number };
  resources: { id: string; name: string }[];
};

const initialState: RoomFormState = { status: "idle" };

export function RoomForm({ room, resources }: Props) {
  const [state, formAction, pending] = useActionState(saveRoomAction, initialState);

  // Depois de um erro, mantém o que a pessoa digitou.
  const values: RoomFormValues =
    state.status === "error"
      ? state.values
      : {
          name: room?.name ?? "",
          capacity: room ? String(room.capacity) : "",
          resourceIds: room?.resourceIds ?? [],
          isActive: room?.isActive ?? true,
        };

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      {room && <input type="hidden" name="roomId" value={room.id} />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" defaultValue={values.name} required minLength={2} maxLength={60} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="capacity">Capacidade (pessoas)</Label>
        <Input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          max={MAX_ROOM_CAPACITY}
          defaultValue={values.capacity}
          required
          className="w-32"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Recursos</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {resources.map((resource) => (
            <label key={resource.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="resourceIds"
                value={resource.id}
                defaultChecked={values.resourceIds.includes(resource.id)}
                className="size-4 accent-primary"
              />
              {resource.name}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={values.isActive} className="size-4 accent-primary" />
        Sala ativa (aparece na listagem e aceita reservas)
      </label>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
        <Link href="/admin/salas" className={buttonVariants({ variant: "ghost" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
