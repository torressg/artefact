import { router } from "../trpc";
import { tarefaRouter } from "./tarefa";

export const appRouter = router({
  tarefa: tarefaRouter,
});

export type AppRouter = typeof appRouter;
