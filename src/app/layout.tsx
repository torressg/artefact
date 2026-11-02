import type { Metadata } from "next";
import Link from "next/link";
import { TRPCProvider } from "@/trpc/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tarefas",
  description: "Gerenciador de tarefas simples com Next.js e tRPC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <TRPCProvider>
          <header className="topo">
            <Link href="/" className="marca">
              Tarefas
            </Link>
            <Link href="/tarefas/nova" className="botao">
              + Nova tarefa
            </Link>
          </header>
          <main>{children}</main>
        </TRPCProvider>
      </body>
    </html>
  );
}
