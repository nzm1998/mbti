"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // 从 URL 读取错误信息
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "CredentialsSignin") {
      setError("邮箱或密码错误");
    } else if (err) {
      setError("登录失败，请重试");
    }

    // 获取 CSRF token
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((d) => setCsrfToken(d.csrfToken))
      .catch(() => {});
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form
        action="/api/auth/callback/credentials"
        method="POST"
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-sm border border-gray-200"
      >
        <h1 className="text-2xl font-bold text-center mb-2">登录</h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="hidden" name="callbackUrl" value="/topics" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            邮箱
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition"
        >
          登录
        </button>

        <p className="text-center text-sm text-gray-500">
          还没有账号？{" "}
          <Link href="/auth/register" className="text-indigo-600 hover:underline">
            注册
          </Link>
        </p>
      </form>
    </main>
  );
}
