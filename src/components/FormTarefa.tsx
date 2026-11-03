"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Aviso } from "@/components/Aviso";
import { mensagemDeErro } from "@/lib/erro";
import { trpc } from "@/trpc/react";

const MAX_TITULO = 120;
const MAX_DESCRICAO = 1000;

type Props = {
  tarefa?: { id: string; titulo: string; descricao?: string };
};

function validarTitulo(titulo: string) {
  if (!titulo.trim()) return "O título é obrigatório";
  if (titulo.trim().length > MAX_TITULO) return `Máximo de ${MAX_TITULO} caracteres`;
  return null;
}

export function FormTarefa({ tarefa }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editando = Boolean(tarefa);

  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");
  const [tocado, setTocado] = useState(false);
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const erroTitulo = tocado ? validarTitulo(titulo) : null;

  const aoSalvar = () => {
    queryClient.removeQueries({ queryKey: getQueryKey(trpc.tarefa.listar) });
    router.push(`/?msg=${editando ? "atualizada" : "criada"}`);
  };
  const aoFalhar = (err: unknown) => setErroServidor(mensagemDeErro(err));

  const criar = trpc.tarefa.criar.useMutation({ onSuccess: aoSalvar, onError: aoFalhar });
  const atualizar = trpc.tarefa.atualizar.useMutation({
    onSuccess: aoSalvar,
    onError: aoFalhar,
  });
  const salvando = criar.isPending || atualizar.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTocado(true);
    setErroServidor(null);
    if (validarTitulo(titulo)) return;

    const dados = { titulo, descricao };
    if (tarefa) atualizar.mutate({ id: tarefa.id, ...dados });
    else criar.mutate(dados);
  }

  return (
    <section className="form-pagina">
      <h1>{editando ? "Editar tarefa" : "Nova tarefa"}</h1>

      {erroServidor && (
        <Aviso aviso={{ tipo: "erro", texto: erroServidor }} onFechar={() => setErroServidor(null)} />
      )}

      <form onSubmit={handleSubmit} noValidate className="form">
        <label className="campo">
          <span>
            Título <em>*</em>
          </span>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={() => setTocado(true)}
            maxLength={MAX_TITULO}
            placeholder="Ex: Revisar relatório da semana"
            aria-invalid={Boolean(erroTitulo)}
            autoFocus
          />
          {erroTitulo && <small className="texto-erro">{erroTitulo}</small>}
        </label>

        <label className="campo">
          <span>Descrição</span>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={MAX_DESCRICAO}
            rows={5}
            placeholder="Detalhes opcionais"
          />
          <small className="dica">
            {descricao.length}/{MAX_DESCRICAO}
          </small>
        </label>

        <div className="form-acoes">
          <Link href="/" className="botao secundario">
            Cancelar
          </Link>
          <button type="submit" className="botao" disabled={salvando}>
            {salvando ? "Salvando…" : editando ? "Salvar alterações" : "Criar tarefa"}
          </button>
        </div>
      </form>
    </section>
  );
}
