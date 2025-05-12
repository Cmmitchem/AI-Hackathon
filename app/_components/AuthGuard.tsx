"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Force redirect to login if not authenticated
  useEffect(() => {
    const isLoginPage = pathname === "/login" || pathname.startsWith("/login/");

    if (status === "unauthenticated" && !isLoginPage) {
      router.push("/login");
    }
  }, [status, router, pathname]);

  return <>{children}</>;
}
