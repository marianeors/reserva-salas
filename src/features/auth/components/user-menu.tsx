import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOut } from "../actions";
import { getCurrentUser } from "../session";

// Lê o cookie: precisa ficar dentro de um <Suspense> (Cache Components).
export async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link href="/entrar" className={buttonVariants({ variant: "outline", size: "sm" })}>
        Entrar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span>
        {user.name}
        {user.role === "ADMIN" && <span className="text-muted-foreground"> · Admin</span>}
      </span>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm">
          Trocar usuário
        </Button>
      </form>
    </div>
  );
}
