

import { LoginForm } from "@/components/(auth)/components/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">Inicia sesión en tu cuenta</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Bienvenido de vuelta. Ingresa tus credenciales para acceder.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes una cuenta?{" "}
        <a href="/register" className="font-medium text-primary hover:underline">
          Regístrate
        </a>
      </p>
    </div>
  );
}
