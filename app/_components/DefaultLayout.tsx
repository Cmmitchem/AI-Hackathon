"use client";

import { usePathname } from "next/navigation";
import AppLayout from "@/app/_components/AppLayout";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname.startsWith("/login/");

  // Don't apply AppLayout for login pages
  if (isLoginPage) {
    return <>{children}</>;
  }

  // For all other pages, use AppLayout
  return <AppLayout>{children}</AppLayout>;
}
