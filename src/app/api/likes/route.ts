import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先设置用户名和 MBTI 类型" }, { status: 401 });
  }

  const { commentId } = await req.json();

  if (!commentId) {
    return NextResponse.json({ error: "缺少 commentId" }, { status: 400 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_commentId: { userId: user.id, commentId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({
    data: { userId: user.id, commentId },
  });

  return NextResponse.json({ liked: true });
}
