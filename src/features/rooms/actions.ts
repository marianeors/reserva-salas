"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/features/auth/session";
import { logger } from "@/lib/logger";
import { saveRoom } from "./queries";
import { readRoomForm, validateRoomForm, type RoomFormValues } from "./room-form";

export type RoomFormState = { status: "idle" } | { status: "error"; message: string; values: RoomFormValues };

const saveErrors = {
  DUPLICATE_NAME: "Já existe uma sala com esse nome.",
  NOT_FOUND: "Sala não encontrada.",
};

// Cria a sala quando o formulário não traz "roomId"; senão, edita.
export async function saveRoomAction(_prev: RoomFormState, formData: FormData): Promise<RoomFormState> {
  // A Server Action checa a permissão por conta própria: pode ser chamada
  // diretamente, sem passar pela página do admin.
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    logger.warn("admin.access_denied", { userId: user?.id ?? null, action: "saveRoom" });
    redirect("/salas");
  }

  const roomId = String(formData.get("roomId") ?? "") || undefined;
  const values = readRoomForm(formData);
  const validation = validateRoomForm(values);
  if (!validation.ok) return { status: "error", message: validation.message, values };

  const result = await saveRoom(roomId, validation.data);
  if (!result.ok) return { status: "error", message: saveErrors[result.reason], values };

  logger.info(roomId ? "room.updated" : "room.created", {
    roomId: result.roomId,
    userId: user.id,
    isActive: validation.data.isActive,
  });
  redirect("/admin/salas");
}
