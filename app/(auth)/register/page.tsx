import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { RegisterForm } from "@/components/(auth)/components/register-form";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Registro en PetSocial</CardTitle>
        <CardDescription>Crea una cuenta para ti y tu mascota</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
