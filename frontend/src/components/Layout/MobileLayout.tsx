"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Package,
  Cable,
  ChartBar,
  Settings,
  ShoppingBag,
  FileText,
} from "lucide-react";

interface MobileLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: FileText, label: "Pedidos", href: "/pedidos" },
  { icon: Package, label: "Produtos", href: "/produtos" },
  { icon: Cable, label: "Integrações", href: "/integracoes" },
  { icon: Settings, label: "Ajustes", href: "/ajustes" },
];

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="flex justify-around items-center h-16 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              >
                <div className={`p-1 rounded-lg transition-all ${
                  isActive ? "bg-blue-50" : ""
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? "w-6 h-6" : ""} transition-all`} />
                </div>
                <span className={`text-[10px] mt-1 font-medium ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}