"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/ui/auth-form";
import { authClient } from "@/lib/auth-client";

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

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Record<string, string>) => {
    setError(null);
    const { error } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError(error.message ?? "Error al crear la cuenta");
      return;
    }

    router.push("/dashboard");
  };

  return <AuthForm mode="register" fields={FIELDS} onSubmit={handleSubmit} serverError={error} />;
}
