"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/ui/auth-form";
import { authClient } from "@/lib/auth-client";

const FIELDS = [
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
    placeholder: "••••••••",
    autoComplete: "current-password",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Record<string, string>) => {
    setError(null);
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError(error.message ?? "Credenciales incorrectas");
      return;
    }

    router.push("/dashboard");
  };

  return <AuthForm mode="login" fields={FIELDS} onSubmit={handleSubmit} serverError={error} />;
}
