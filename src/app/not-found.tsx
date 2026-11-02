import Link from "next/link";

export default function NotFound() {
  return (
    <div className="vazio">
      <h1>Tarefa não encontrada</h1>
      <p>Ela pode ter sido excluída ou o link está errado.</p>
      <Link href="/" className="botao">
        Voltar para a lista
      </Link>
    </div>
  );
}
