"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { cancelBooking, type CancelBookingState } from "../actions";

const initialState: CancelBookingState = { status: "idle" };

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(cancelBooking, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        // Evita cancelamento por clique acidental.
        if (!window.confirm("Cancelar esta reserva?")) event.preventDefault();
      }}
      className="flex flex-col items-end gap-1"
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        {pending ? "Cancelando..." : "Cancelar"}
      </Button>
      {state.status === "error" && (
        <p role="alert" className="text-xs text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
