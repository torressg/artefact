import { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";

export function mensagemDeErro(err: unknown): string {
  if (err instanceof TRPCClientError) {
    const e = err as TRPCClientError<AppRouter>;
    const campos = e.data?.zodError?.fieldErrors as Record<string, string[] | undefined> | undefined;
    if (campos) {
      const primeira = Object.values(campos).flat()[0];
      if (primeira) return primeira;
    }
    if (e.message === "Failed to fetch") {
      return "Não foi possível falar com o servidor. Verifique sua conexão.";
    }
    return e.message;
  }
  return "Algo deu errado. Tente novamente.";
}
