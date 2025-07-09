"use client";

import { useSession } from "next-auth/react";
import ResponsiveLayout from "@/components/Layout/ResponsiveLayout";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

export default function PedidosPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (!session) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">Sem sessão ativa</div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-4 md:px-6 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm md:text-base text-gray-600">
            Acompanhe todos os pedidos recebidos
          </p>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          <div className="bg-white rounded-xl p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Página em Desenvolvimento
            </h2>
            <p className="text-gray-600">
              Em breve você poderá visualizar e gerenciar todos os seus pedidos aqui.
            </p>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}