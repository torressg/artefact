"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="vazio">
      <h1>Ops, algo deu errado</h1>
      <p>Não foi possível carregar essa página.</p>
      <button type="button" className="botao" onClick={reset}>
        Tentar de novo
      </button>
    </div>
  );
}
