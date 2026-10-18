"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBooking, type BookingFormState } from "../actions";

type Props = {
  roomId: string;
  // Data de hoje em Brasília, calculada no servidor (evita depender do fuso do navegador).
  today: string;
};

const initialState: BookingFormState = { status: "idle" };

export function BookingForm({ roomId, today }: Props) {
  const [state, formAction, pending] = useActionState(createBooking, initialState);
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="roomId" value={roomId} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" name="date" type="date" min={today} defaultValue={values?.date ?? today} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="startTime">Início</Label>
          <Input id="startTime" name="startTime" type="time" defaultValue={values?.startTime} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="endTime">Fim</Label>
          <Input id="endTime" name="endTime" type="time" defaultValue={values?.endTime} required />
        </div>
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Reservando..." : "Reservar"}
      </Button>
    </form>
  );
}
