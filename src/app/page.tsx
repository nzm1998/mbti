"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MBTI_TYPES, getMbtiInfo } from "@/lib/mbti";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 如果已有 cookie，直接跳转到话题广场
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) router.replace("/topics");
      })
      .catch(() => {});
  }, [router]);

  async function handleConfirm() {
    if (!selected || !username.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), mbtiType: selected }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "出错了");
      setLoading(false);
      return;
    }

    router.push("/topics");
    router.refresh();
  }

  const selectedInfo = getMbtiInfo(selected);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">MBTI Wall</h1>
          <p className="text-gray-500">
            按人格分类的轻量社区 — 先给自己选个类型吧
          </p>
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            你的名字
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="输入昵称…"
            maxLength={30}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg"
          />
        </div>

        {/* MBTI Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            你的 MBTI 人格
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MBTI_TYPES.map((mbti) => {
              const isSelected = selected === mbti.type;
              return (
                <button
                  key={mbti.type}
                  type="button"
                  onClick={() => {
                    setSelected(mbti.type);
                    setConfirming(false);
                    setError("");
                  }}
                  className={`rounded-xl border-2 p-3 text-center transition-all cursor-pointer ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="text-2xl mb-0.5">{mbti.emoji}</div>
                  <div className="font-bold text-sm">{mbti.type}</div>
                  <div className="text-xs text-gray-500">{mbti.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4 text-center">
            {error}
          </p>
        )}

        {/* Selected confirmation */}
        {selected && !confirming && username.trim() && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              你好{" "}
              <span className="font-semibold text-gray-800">{username}</span>
              ，你选择了{" "}
              {selectedInfo && (
                <span
                  className="font-bold px-2 py-0.5 rounded-full text-white text-sm"
                  style={{ backgroundColor: selectedInfo.color }}
                >
                  {selectedInfo.emoji} {selectedInfo.type}
                </span>
              )}
            </p>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-xl bg-indigo-600 px-8 py-3 text-white font-medium hover:bg-indigo-700 transition"
            >
              确认，进入社区
            </button>
          </div>
        )}

        {!username.trim() && selected && (
          <p className="text-center text-sm text-amber-600">
            请先输入昵称
          </p>
        )}

        {/* Final confirmation */}
        {confirming && (
          <div className="mt-4 text-center">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="text-amber-800 font-medium mb-1">
                ⚠️ MBTI 类型选定后不能更改
              </p>
              <p className="text-amber-700 text-sm mb-4">
                确定 {username} 是 {selectedInfo?.emoji} {selectedInfo?.type}{" "}
                {selectedInfo?.label} 吗？
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-xl border border-gray-300 px-6 py-2 text-gray-700 hover:bg-white transition"
                >
                  再想想
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="rounded-xl bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "进入中..." : "确定，出发！"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
