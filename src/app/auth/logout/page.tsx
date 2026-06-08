"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">正在退出登录…</p>
    </main>
  );
}
