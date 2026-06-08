import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { commentId } = await req.json();

  if (!commentId) {
    return NextResponse.json({ error: "缺少 commentId" }, { status: 400 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_commentId: { userId: session.user.id, commentId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({
    data: { userId: session.user.id, commentId },
  });

  return NextResponse.json({ liked: true });
}
