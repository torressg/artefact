"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { Aviso, type AvisoState } from "@/components/Aviso";
import { mensagemDeErro } from "@/lib/erro";
import { trpc } from "@/trpc/react";
import type { AppRouter } from "@/server/routers/_app";

type PaginaTarefas = inferRouterOutputs<AppRouter>["tarefa"]["listar"];

const MENSAGENS: Record<string, string> = {
  criada: "Tarefa criada com sucesso!",
  atualizada: "Tarefa atualizada com sucesso!",
};

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function ListaTarefas({
  primeiraPagina,
  porPagina,
  mensagemInicial,
}: {
  primeiraPagina: PaginaTarefas;
  porPagina: number;
  mensagemInicial?: string;
}) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [aviso, setAviso] = useState<AvisoState | null>(() =>
    mensagemInicial && MENSAGENS[mensagemInicial]
      ? { tipo: "sucesso", texto: MENSAGENS[mensagemInicial] }
      : null,
  );
  const fecharAviso = useCallback(() => setAviso(null), []);

  useEffect(() => {
    if (mensagemInicial) router.replace("/", { scroll: false });
  }, [mensagemInicial, router]);

  const lista = trpc.tarefa.listar.useInfiniteQuery(
    { limit: porPagina },
    {
      getNextPageParam: (ultima) => ultima.nextCursor,
      initialData: { pages: [primeiraPagina], pageParams: [null] },
    },
  );

  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const deletar = trpc.tarefa.deletar.useMutation({
    onMutate: ({ id }) => setDeletandoId(id),
    onSuccess: async () => {
      setAviso({ tipo: "sucesso", texto: "Tarefa excluída." });
      await utils.tarefa.listar.invalidate();
    },
    onError: (err) => setAviso({ tipo: "erro", texto: mensagemDeErro(err) }),
    onSettled: () => setDeletandoId(null),
  });

  const sentinela = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = lista;
  useEffect(() => {
    const el = sentinela.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tarefas = lista.data?.pages.flatMap((p) => p.items) ?? [];
  const total = lista.data?.pages[0]?.total ?? 0;

  function confirmarExclusao(id: string, titulo: string) {
    if (window.confirm(`Excluir a tarefa "${titulo}"?`)) {
      deletar.mutate({ id });
    }
  }

  return (
    <section>
      <div className="cabecalho-lista">
        <h1>Minhas tarefas</h1>
        <span className="contador">
          {total} {total === 1 ? "tarefa" : "tarefas"}
        </span>
      </div>

      {aviso && <Aviso aviso={aviso} onFechar={fecharAviso} />}

      {tarefas.length === 0 ? (
        <div className="vazio">
          <p>Nenhuma tarefa por aqui.</p>
          <Link href="/tarefas/nova" className="botao">
            Criar a primeira tarefa
          </Link>
        </div>
      ) : (
        <ul className="lista">
          {tarefas.map((t) => (
            <li key={t.id} className={deletandoId === t.id ? "card saindo" : "card"}>
              <div className="card-conteudo">
                <h2>{t.titulo}</h2>
                {t.descricao && <p>{t.descricao}</p>}
                <time dateTime={t.dataCriacao.toISOString()} suppressHydrationWarning>
                  Criada em {formatoData.format(t.dataCriacao)}
                  {t.dataAtualizacao && " · editada"}
                </time>
              </div>
              <div className="card-acoes">
                <Link href={`/tarefas/${t.id}/editar`} className="botao secundario">
                  Editar
                </Link>
                <button
                  type="button"
                  className="botao perigo"
                  disabled={deletandoId === t.id}
                  onClick={() => confirmarExclusao(t.id, t.titulo)}
                >
                  {deletandoId === t.id ? "Excluindo…" : "Excluir"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinela} className="rodape-lista">
        {isFetchingNextPage && <span>Carregando mais tarefas…</span>}
        {lista.isError && !isFetchingNextPage && (
          <span className="texto-erro">
            {mensagemDeErro(lista.error)}{" "}
            <button type="button" className="link" onClick={() => fetchNextPage()}>
              Tentar de novo
            </button>
          </span>
        )}
        {!hasNextPage && tarefas.length > porPagina && <span>Isso é tudo</span>}
      </div>
    </section>
  );
}
