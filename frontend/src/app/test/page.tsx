"use client";

import { useSession } from "next-auth/react";

export default function TestPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Página de Teste</h1>
      <div className="space-y-2">
        <p>Status: {status}</p>
        <p>Sessão: {session ? "Ativa" : "Inativa"}</p>
        {session && (
          <>
            <p>Email: {session.user?.email}</p>
            <p>Nome: {session.user?.name}</p>
          </>
        )}
      </div>
    </div>
  );
}