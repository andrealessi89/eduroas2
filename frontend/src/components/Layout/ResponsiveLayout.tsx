"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import MobileLayout from "./MobileLayout";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}