"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // 1. 获取 CSRF token
      const csrfRes = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfRes.json();

      // 2. 手动发登录请求
      const loginRes = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ csrfToken, callbackUrl: "/topics", email, password }),
        redirect: "manual",
      });

      // 3. 检查 302 重定向到哪
      if (loginRes.status === 302 || loginRes.status === 200) {
        const location = loginRes.headers.get("location") || "";
        
        if (location.includes("error=")) {
          setError("邮箱或密码错误");
          setLoading(false);
          return;
        }

        // 有重定向地址 → 登录成功，跳转
        if (location) {
          window.location.href = location;
          return;
        }
      }

      // 其他状态码
      const text = await loginRes.text();
      console.error("Login failed:", loginRes.status, text);
      setError(`登录失败 (${loginRes.status})`);
    } catch (err) {
      console.error("Login exception:", err);
      setError("网络错误，请检查连接后重试");
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-sm border border-gray-200"
      >
        <h1 className="text-2xl font-bold text-center mb-2">登录</h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

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
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "登录中..." : "登录"}
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
