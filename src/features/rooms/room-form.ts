import { z } from "zod";
import { MAX_ROOM_DURATION_MINUTES, MIN_DURATION_MINUTES } from "@/features/bookings/rules";

export const MAX_ROOM_CAPACITY = 100;

const roomFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome precisa ter pelo menos 2 caracteres.")
    .max(60, "O nome pode ter no máximo 60 caracteres."),
  capacity: z.coerce
    .number({ error: "Informe a capacidade." })
    .int("A capacidade precisa ser um número inteiro.")
    .min(1, "A capacidade mínima é 1 pessoa.")
    .max(MAX_ROOM_CAPACITY, `A capacidade máxima é ${MAX_ROOM_CAPACITY} pessoas.`),
  maxDurationMinutes: z.coerce
    .number({ error: "Informe a duração máxima." })
    .int("A duração máxima precisa ser um número inteiro de minutos.")
    .min(MIN_DURATION_MINUTES, `A duração máxima precisa ser de pelo menos ${MIN_DURATION_MINUTES} minutos.`)
    .max(MAX_ROOM_DURATION_MINUTES, `A duração máxima pode ser de até ${MAX_ROOM_DURATION_MINUTES} minutos (8 h).`),
  resourceIds: z.array(z.string().min(1)),
  isActive: z.boolean(),
});

export type RoomFormData = z.infer<typeof roomFormSchema>;

export type RoomFormValues = {
  name: string;
  capacity: string;
  maxDurationMinutes: string;
  resourceIds: string[];
  isActive: boolean;
};

// Lê o FormData do formulário de sala (checkbox marcado envia "on").
export function readRoomForm(formData: FormData): RoomFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    capacity: String(formData.get("capacity") ?? ""),
    maxDurationMinutes: String(formData.get("maxDurationMinutes") ?? ""),
    resourceIds: formData.getAll("resourceIds").map(String),
    isActive: formData.get("isActive") === "on",
  };
}

export function validateRoomForm(values: RoomFormValues) {
  const result = roomFormSchema.safeParse(values);
  if (result.success) return { ok: true as const, data: result.data };
  return { ok: false as const, message: result.error.issues[0].message };
}
