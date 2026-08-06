import { z } from "zod";

export const schemaRegistro = z.object({
  repositoryName: z
    .string()
    .regex(
      /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/,
      "Formato de repositorio inválido",
    )
    .min(3, "El nombre del repositorio es requerido"),
  email: z
    .string()
    .email("Correo electrónico inválido")
    .min(1, "El correo electrónico es requerido"),
});

export type RegistroForm = z.infer<typeof schemaRegistro>;
