"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import MagazordTab from "@/components/Integracoes/MagazordTab";
import TokensTab from "@/components/Integracoes/TokensTab";
import MetaAdsTab from "@/components/Integracoes/MetaAdsTab";
import { Cable } from "lucide-react";

type TabType = "magazord" | "tokens" | "meta";

export default function IntegracoesPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("magazord");

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Sem sessão ativa</div>
      </div>
    );
  }

  const tabs = [
    { id: "magazord" as TabType, label: "Magazord", description: "Configure sua integração com o Magazord" },
    { id: "meta" as TabType, label: "Meta Ads", description: "Configure sua integração com Meta Ads" },
    { id: "tokens" as TabType, label: "Tokens da API", description: "Gerencie seus tokens de acesso" },
  ];

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Integrações</h1>
          <p className="text-gray-600">
            Configure as integrações com plataformas externas e gerencie tokens de acesso
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-6 text-sm font-medium border-b-2 transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "magazord" && <MagazordTab />}
            {activeTab === "meta" && <MetaAdsTab />}
            {activeTab === "tokens" && <TokensTab />}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4 flex items-start">
          <Cable className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sobre as integrações</p>
            <p>
              As integrações permitem que o sistema se conecte com outras plataformas para importar dados automaticamente.
              Os tokens de API são usados para autenticar requisições externas ao sistema.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}