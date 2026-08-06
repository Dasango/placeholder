import { z } from "zod";

export const configSchema = z
  .object({
    repositoryName: z
      .string()
      .trim()
      .min(1, "El nombre del repositorio es requerido")
      .regex(
        /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/,
        "Formato de repositorio inválido (ej. propietario/repositorio)",
      ),
    email: z.union([
      z.literal(""),
      z.string().trim().email("Correo electrónico inválido"),
    ]),
    isPrivate: z.boolean(),
    token: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (data.isPrivate) {
      if (!data.token) {
        ctx.addIssue({
          code: "custom",
          path: ["token"],
          message: "Token requerido para repositorios privados",
        });
      } else if (data.token.length < 40) {
        ctx.addIssue({
          code: "custom",
          path: ["token"],
          message: "El token debe tener al menos 40 caracteres",
        });
      }
    }
  });

export type ConfigFormData = z.infer<typeof configSchema>;
