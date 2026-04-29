"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm, type SlugConfig } from "@/components/ui/auth-form";
import { authClient } from "@/lib/auth-client";

// ─────────────────────────────────────────────────────────────────────────────
// TODO: reemplaza esta función con tu endpoint real, por ejemplo:
//

//
async function checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
  // Placeholder — siempre retorna disponible hasta que conectes el endpoint
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/barberias/check-slug?slug=${slug}`);
  const json = await res.json();
  return { available: json.available };
}
// ─────────────────────────────────────────────────────────────────────────────

const FIELDS = [
  {
    id: "name",
    label: "Nombre completo",
    type: "text",
    placeholder: "Juan Pérez",
    autoComplete: "name",
  },
  {
    id: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "tu@barberia.com",
    autoComplete: "email",
  },
  {
    id: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "Mínimo 8 caracteres",
    autoComplete: "new-password",
  },
];

const slugConfig: SlugConfig = {
  validateSlug: checkSlugAvailability,
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Record<string, string>) => {
    setError(null);

    const isCliente = data.role === "cliente";

    const { error } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
      // @ts-expect-error — campos personalizados del dominio
      role: data.role ?? "barberia",
      ...(!isCliente && {
        barberiaName: data.barberiaName || undefined,
        slug:         data.slug         || undefined,
      }),
    });

    if (error) {
      setError(error.message ?? "Error al crear la cuenta");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <AuthForm
      mode="register"
      fields={FIELDS}
      onSubmit={handleSubmit}
      serverError={error}
      slugConfig={slugConfig}
      showRoleSelector
    />
  );
}
