"use client";

import { useSession } from "next-auth/react";
import ResponsiveLayout from "@/components/Layout/ResponsiveLayout";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";

export default function AjustesPage() {
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

  const settingsOptions = [
    {
      icon: User,
      title: "Perfil",
      description: "Gerencie suas informações pessoais",
      href: "#",
    },
    {
      icon: Bell,
      title: "Notificações",
      description: "Configure alertas e notificações",
      href: "#",
    },
    {
      icon: Shield,
      title: "Segurança",
      description: "Configurações de segurança da conta",
      href: "#",
    },
    {
      icon: Palette,
      title: "Aparência",
      description: "Personalize a interface do sistema",
      href: "#",
    },
  ];

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-4 md:px-6 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Ajustes</h1>
          <p className="text-sm md:text-base text-gray-600">
            Configure suas preferências
          </p>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settingsOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.title}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* User Info */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">
              Informações da Conta
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium text-gray-900">{session.user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{session.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo de conta</p>
                <p className="font-medium text-gray-900">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}