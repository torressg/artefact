import { randomUUID } from "node:crypto";

export type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
  dataAtualizacao?: Date;
};

const globalForDb = globalThis as unknown as { tarefas?: Map<string, Tarefa> };

export const tarefas = (globalForDb.tarefas ??= seed());

export function novoId() {
  return randomUUID();
}

function seed() {
  const map = new Map<string, Tarefa>();
  const exemplos = [
    "Revisar PR do módulo de relatórios",
    "Preparar pauta da daily",
    "Atualizar dependências do projeto",
    "Escrever testes do formulário de cadastro",
    "Corrigir bug no filtro de datas",
    "Organizar backlog da sprint",
    "Documentar endpoints da API",
    "Configurar CI no repositório",
    "Responder feedback do time de design",
    "Revisar textos da landing page",
  ];
  const agora = Date.now();

  for (let i = 0; i < 25; i++) {
    const id = novoId();
    map.set(id, {
      id,
      titulo: `${exemplos[i % exemplos.length]} #${i + 1}`,
      descricao: i % 3 === 0 ? undefined : "Tarefa de exemplo gerada automaticamente.",
      dataCriacao: new Date(agora - (25 - i) * 60 * 60 * 1000),
    });
  }
  return map;
}
