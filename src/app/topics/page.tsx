import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TopicsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await prisma.mbtiProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/mbti/select");

  const topics = await prisma.topic.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { comments: true } },
    },
  });

  const topicIcons: Record<string, string> = {
    xiaoque: "🌻",
    sentence: "📝",
    emo: "🌧️",
    question: "❓",
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">话题广场</h1>
            <p className="text-sm text-gray-500 mt-1">
              {profile.mbtiType} · 看看大家在说什么
            </p>
          </div>
          <Link
            href="/auth/logout"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            退出
          </Link>
        </div>

        <div className="grid gap-4">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className="block rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{topicIcons[topic.slug] || "💬"}</span>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{topic.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {topic.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {topic._count.comments} 条发言
                  </p>
                </div>
                <span className="text-gray-300 text-lg">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
