import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先设置用户名和 MBTI 类型" }, { status: 401 });
  }

  const { topicId, content } = await req.json();

  if (!topicId || !content?.trim()) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }

  if (content.length > 140) {
    return NextResponse.json({ error: "不能超过 140 字" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId: user.id,
      topicId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          mbtiProfile: { select: { mbtiType: true } },
        },
      },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  const mbtiFilter = searchParams.get("mbti");

  if (!topicId) {
    return NextResponse.json({ error: "缺少 topicId" }, { status: 400 });
  }

  const where: Record<string, unknown> = { topicId };
  if (mbtiFilter) {
    where.user = { mbtiProfile: { mbtiType: mbtiFilter } };
  }

  const comments = await prisma.comment.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          mbtiProfile: { select: { mbtiType: true } },
        },
      },
      _count: { select: { likes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(comments);
}
