import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ likedIds: [] });
  }

  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");

  if (!topicId) {
    return NextResponse.json({ likedIds: [] });
  }

  const comments = await prisma.comment.findMany({
    where: { topicId },
    select: { id: true },
  });

  const commentIds = comments.map((c) => c.id);

  const likes = await prisma.like.findMany({
    where: {
      userId: session.user.id,
      commentId: { in: commentIds },
    },
    select: { commentId: true },
  });

  return NextResponse.json({
    likedIds: likes.map((l) => l.commentId),
  });
}
