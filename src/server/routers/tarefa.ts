import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { novoId, tarefas, type Tarefa } from "../db";
import { publicProcedure, router } from "../trpc";

const titulo = z
  .string()
  .trim()
  .min(1, "O título é obrigatório")
  .max(120, "O título pode ter no máximo 120 caracteres");

const descricao = z
  .string()
  .trim()
  .max(1000, "A descrição pode ter no máximo 1000 caracteres")
  .optional()
  .transform((v) => (v ? v : undefined));

function buscarOuFalhar(id: string): Tarefa {
  const tarefa = tarefas.get(id);
  if (!tarefa) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Tarefa não encontrada. Ela pode ter sido removida.",
    });
  }
  return tarefa;
}

function compararPorMaisRecente(a: Tarefa, b: Tarefa) {
  const diff = b.dataCriacao.getTime() - a.dataCriacao.getTime();
  if (diff !== 0) return diff;
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}

export const tarefaRouter = router({
  listar: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
        cursor: z.object({ data: z.number(), id: z.string() }).nullish(),
      }),
    )
    .query(({ input }) => {
      const ordenadas = [...tarefas.values()].sort(compararPorMaisRecente);
      const cursor = input.cursor;

      const restantes = cursor
        ? ordenadas.filter(
            (t) =>
              t.dataCriacao.getTime() < cursor.data ||
              (t.dataCriacao.getTime() === cursor.data && t.id < cursor.id),
          )
        : ordenadas;

      const items = restantes.slice(0, input.limit);
      const ultima = items[items.length - 1];

      return {
        items,
        nextCursor:
          restantes.length > input.limit
            ? { data: ultima.dataCriacao.getTime(), id: ultima.id }
            : null,
        total: ordenadas.length,
      };
    }),

  buscar: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => buscarOuFalhar(input.id)),

  criar: publicProcedure
    .input(z.object({ titulo, descricao }))
    .mutation(({ input }) => {
      const tarefa: Tarefa = {
        id: novoId(),
        titulo: input.titulo,
        descricao: input.descricao,
        dataCriacao: new Date(),
      };
      tarefas.set(tarefa.id, tarefa);
      return tarefa;
    }),

  atualizar: publicProcedure
    .input(z.object({ id: z.string(), titulo, descricao }))
    .mutation(({ input }) => {
      const atual = buscarOuFalhar(input.id);
      const atualizada: Tarefa = {
        ...atual,
        titulo: input.titulo,
        descricao: input.descricao,
        dataAtualizacao: new Date(),
      };
      tarefas.set(atual.id, atualizada);
      return atualizada;
    }),

  deletar: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const tarefa = buscarOuFalhar(input.id);
      tarefas.delete(tarefa.id);
      return { id: tarefa.id };
    }),
});
