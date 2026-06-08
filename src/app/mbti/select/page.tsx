"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MBTI_TYPES, getMbtiInfo } from "@/lib/mbti";

export default function MbtiSelectPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/mbti/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mbtiType: selected }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "选择失败");
      setLoading(false);
      return;
    }

    await update();
    router.push("/topics");
    router.refresh();
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-2">选择你的 MBTI 人格</h1>
        <p className="text-gray-500 text-center mb-8">选好后将终身绑定，无法更改！</p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4 text-center">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MBTI_TYPES.map((mbti) => {
            const isSelected = selected === mbti.type;
            return (
              <button
                key={mbti.type}
                onClick={() => {
                  setSelected(mbti.type);
                  setConfirming(false);
                }}
                className={`rounded-2xl border-2 p-4 text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <div className="text-3xl mb-1">{mbti.emoji}</div>
                <div className="font-bold text-lg">{mbti.type}</div>
                <div className="text-sm text-gray-500">{mbti.label}</div>
              </button>
            );
          })}
        </div>

        {selected && !confirming && (
          <div className="mt-8 text-center">
            <p className="text-lg mb-4">
              你选择了{" "}
              <span
                className="font-bold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: getMbtiInfo(selected)?.color }}
              >
                {getMbtiInfo(selected)?.emoji} {selected}{" "}
                {getMbtiInfo(selected)?.label}
              </span>
            </p>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-xl bg-indigo-600 px-8 py-3 text-white font-medium hover:bg-indigo-700 transition"
            >
              确认选择
            </button>
          </div>
        )}

        {confirming && (
          <div className="mt-6 text-center">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 max-w-md mx-auto">
              <p className="text-red-700 font-medium mb-2">
                ⚠️ 选定了就不能再改了，确定吗？
              </p>
              <p className="text-red-600 text-sm mb-4">
                你选择了{" "}
                <strong>
                  {getMbtiInfo(selected)?.emoji} {selected}{" "}
                  {getMbtiInfo(selected)?.label}
                </strong>
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
                  className="rounded-xl bg-red-500 px-6 py-2 text-white font-medium hover:bg-red-600 transition disabled:opacity-50"
                >
                  {loading ? "保存中..." : "确认，不改了"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
