import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">MBTI Wall</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        按人格分类的轻量社区——发现和你一样的人正在想什么
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth/register"
          className="rounded-xl bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700 transition"
        >
          注册
        </Link>
        <Link
          href="/auth/login"
          className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 transition"
        >
          登录
        </Link>
      </div>
    </main>
  );
}
