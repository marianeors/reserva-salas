import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/features/auth/actions";
import { listUsersForSignIn } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function EntrarPage() {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Entrar como</CardTitle>
        <CardDescription>Login de demonstração: escolha um usuário do seed.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<p className="text-muted-foreground">Carregando usuários...</p>}>
          <UserOptions />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function UserOptions() {
  // Lê o banco a cada requisição, nunca no build (no CI não há banco).
  await connection();
  const users = await listUsersForSignIn();

  return (
    <ul className="flex flex-col gap-2">
      {users.map((user) => (
        <li key={user.id}>
          <form action={signIn}>
            <input type="hidden" name="userId" value={user.id} />
            <Button type="submit" variant="outline" className="w-full justify-between">
              {user.name}
              <span className="text-xs text-muted-foreground">
                {user.role === "ADMIN" ? "Administrador" : "Usuário"}
              </span>
            </Button>
          </form>
        </li>
      ))}
    </ul>
  );
}
