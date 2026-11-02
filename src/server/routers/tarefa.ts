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

export const tarefaRouter = router({
  listar: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(({ input }) => {
      const ordenadas = [...tarefas.values()].sort(
        (a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime(),
      );

      let inicio = 0;
      if (input.cursor) {
        const idx = ordenadas.findIndex((t) => t.id === input.cursor);
        if (idx === -1) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cursor inválido" });
        }
        inicio = idx + 1;
      }

      const items = ordenadas.slice(inicio, inicio + input.limit);
      const temMais = inicio + input.limit < ordenadas.length;

      return {
        items,
        nextCursor: temMais ? items[items.length - 1].id : null,
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
