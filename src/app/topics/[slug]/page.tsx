"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { MBTI_TYPES, getMbtiInfo } from "@/lib/mbti";

interface CommentUser {
  id: string;
  username: string;
  mbtiProfile: { mbtiType: string } | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
  _count: { likes: number };
}

interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
}

const TOPIC_META: Record<string, { icon: string; gradient: string }> = {
  xiaoque: { icon: "🌻", gradient: "from-yellow-100 to-orange-50" },
  sentence: { icon: "📝", gradient: "from-blue-100 to-indigo-50" },
  emo: { icon: "🌧️", gradient: "from-purple-100 to-pink-50" },
  question: { icon: "❓", gradient: "from-green-100 to-teal-50" },
};

export default function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [mbtiFilter, setMbtiFilter] = useState<string>("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const meta = TOPIC_META[slug] || { icon: "💬", gradient: "from-gray-100 to-gray-50" };

  const fetchComments = useCallback(async () => {
    if (!topic) return;
    const params = new URLSearchParams({ topicId: topic.id });
    if (mbtiFilter) params.set("mbti", mbtiFilter);

    const [commentsRes, likesRes] = await Promise.all([
      fetch(`/api/comments?${params}`),
      fetch(`/api/likes/mine?topicId=${topic.id}`),
    ]);

    const commentsData = await commentsRes.json();
    const likesData = await likesRes.json();

    setComments(commentsData);
    setLikedIds(new Set(likesData.likedIds));
  }, [topic, mbtiFilter]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/topics/${slug}`)
      .then((r) => r.json())
      .then(setTopic);
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !topic || submitting) return;
    setSubmitting(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId: topic.id, content: newComment.trim() }),
    });

    if (res.ok) {
      setNewComment("");
      await fetchComments();
    }
    setSubmitting(false);
  }

  async function handleLike(commentId: string) {
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });

    if (res.ok) {
      await fetchComments();
    }
  }

  const userMbti = session?.user?.name
    ? undefined // We'll get it from the profile check later
    : undefined;

  const remaining = 140 - newComment.length;

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div
          className={`rounded-2xl bg-gradient-to-r ${meta.gradient} p-6 mb-6`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{meta.icon}</span>
            <div>
              <h1 className="text-2xl font-bold">{topic?.title || "加载中..."}</h1>
              <p className="text-gray-600 text-sm">{topic?.description}</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/topics")}
            className="text-sm text-gray-500 hover:text-gray-700 mt-2 inline-block"
          >
            ← 返回话题广场
          </button>
        </div>

        {/* MBTI Filter */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setMbtiFilter("")}
            className={`shrink-0 rounded-full px-3 py-1 text-sm transition ${
              !mbtiFilter
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部
          </button>
          {MBTI_TYPES.map((mbti) => (
            <button
              key={mbti.type}
              onClick={() => setMbtiFilter(mbti.type)}
              className={`shrink-0 rounded-full px-3 py-1 text-sm transition ${
                mbtiFilter === mbti.type
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={
                mbtiFilter === mbti.type
                  ? { backgroundColor: mbti.color }
                  : undefined
              }
            >
              {mbti.emoji} {mbti.type}
            </button>
          ))}
        </div>

        {/* New Comment Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写一句话…"
              maxLength={140}
              rows={2}
              className="w-full resize-none outline-none text-gray-800 placeholder-gray-400"
            />
            <div className="flex items-center justify-between mt-2">
              <span
                className={`text-xs ${
                  remaining < 20 ? "text-red-500" : "text-gray-400"
                }`}
              >
                {remaining}
              </span>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm text-white font-medium hover:bg-indigo-700 transition disabled:opacity-40"
              >
                {submitting ? "发送中..." : "发送"}
              </button>
            </div>
          </div>
        </form>

        {/* Comments Feed */}
        <div className="space-y-3">
          {comments.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">{meta.icon}</p>
              <p>还没有发言，来做第一个吧</p>
            </div>
          )}

          {comments.map((comment) => {
            const mbtiInfo = getMbtiInfo(comment.user.mbtiProfile?.mbtiType);
            const isLiked = likedIds.has(comment.id);
            return (
              <div
                key={comment.id}
                className="rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{
                      backgroundColor: mbtiInfo?.color || "#ddd",
                    }}
                  >
                    {mbtiInfo?.emoji || "❓"}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* User info */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                        style={{
                          backgroundColor: mbtiInfo?.color || "#999",
                        }}
                      >
                        {mbtiInfo?.emoji} {comment.user.mbtiProfile?.mbtiType}
                      </span>
                      <span className="text-sm text-gray-600">
                        {comment.user.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-gray-800">{comment.content}</p>

                    {/* Like button */}
                    <button
                      onClick={() => handleLike(comment.id)}
                      className={`mt-2 flex items-center gap-1 text-sm transition ${
                        isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"
                      }`}
                    >
                      {isLiked ? "❤️" : "🤍"} {comment._count.likes}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
