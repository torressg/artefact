# Tarefas

Desafio técnico: um CRUD de tarefas com Next.js 15 e tRPC, guardando tudo em memória.

## Rodando

Precisa de Node 20.

```bash
npm install
npm run dev
```

Abre em http://localhost:3000. Já sobe com algumas tarefas de exemplo pra dar pra testar o scroll infinito. Como não tem banco, reiniciou o servidor, a lista volta pro começo.

## Como funciona

O backend é um router tRPC em `src/server/routers/tarefa.ts` com listar, buscar, criar, atualizar e deletar, servido em `/api/trpc`. As tarefas ficam num `Map` em `src/server/db.ts`.

A home é renderizada no servidor. O server component chama o router direto (sem passar por HTTP) e manda a primeira página pra lista, que usa ela como `initialData` do `useInfiniteQuery`. Dali pra frente as próximas páginas vão sendo buscadas conforme você rola.

Criar e editar usam o mesmo formulário. O título é validado no front e de novo no back com zod, e os erros do backend (tarefa que não existe, título vazio etc.) aparecem na tela.

## Algumas escolhas

- paginação por cursor em vez de offset, pra não pular nem repetir tarefa quando alguma é excluída no meio
- superjson pra `dataCriacao` chegar no cliente como `Date` e não como string
- o `Map` fica no `globalThis` pra não zerar a cada hot reload em dev
