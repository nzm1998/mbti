import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
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
      userId: session.user.id,
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
