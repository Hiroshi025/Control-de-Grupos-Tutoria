import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">ITSOEH</h1>
          <p className="text-muted-foreground">
            Instituto Tecnológico Superior del Occidente del Estado de Hidalgo
          </p>
        </div>
        <Suspense fallback={<div>Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
