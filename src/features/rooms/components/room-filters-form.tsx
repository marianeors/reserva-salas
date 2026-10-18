import Form from "next/form";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoomFilters } from "../filters";

type Props = {
  filters: RoomFilters;
  resources: { id: string; name: string }[];
};

// Formulário GET: ao enviar, os campos viram parâmetros da URL
// (/salas?capacidade=8&recurso=Projetor) e a página relê os filtros no servidor.
export function RoomFiltersForm({ filters, resources }: Props) {
  return (
    <Form action="/salas" className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-2">
        <Label htmlFor="capacidade">Capacidade mínima</Label>
        <Input
          id="capacidade"
          name="capacidade"
          type="number"
          min={1}
          placeholder="Ex.: 8"
          defaultValue={filters.minCapacity}
          className="w-32"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Recursos</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {resources.map((resource) => (
            <label key={resource.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="recurso"
                value={resource.name}
                defaultChecked={filters.resources.includes(resource.name)}
                className="size-4 accent-primary"
              />
              {resource.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2 sm:ml-auto">
        <Button type="submit">Filtrar</Button>
        <Link href="/salas" className={buttonVariants({ variant: "ghost" })}>
          Limpar
        </Link>
      </div>
    </Form>
  );
}
