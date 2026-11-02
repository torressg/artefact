import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { FormTarefa } from "@/components/FormTarefa";
import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function EditarTarefaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const tarefa = await api.tarefa.buscar({ id });
    return <FormTarefa tarefa={tarefa} />;
  } catch (err) {
    if (err instanceof TRPCError && err.code === "NOT_FOUND") notFound();
    throw err;
  }
}
