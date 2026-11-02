import { ListaTarefas } from "@/components/ListaTarefas";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

const POR_PAGINA = 10;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const [primeiraPagina, { msg }] = await Promise.all([
    api.tarefa.listar({ limit: POR_PAGINA }),
    searchParams,
  ]);

  return (
    <ListaTarefas
      primeiraPagina={primeiraPagina}
      porPagina={POR_PAGINA}
      mensagemInicial={msg}
    />
  );
}
