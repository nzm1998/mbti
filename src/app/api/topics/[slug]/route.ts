import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const topic = await prisma.topic.findUnique({
    where: { slug },
  });

  if (!topic) {
    return NextResponse.json({ error: "话题不存在" }, { status: 404 });
  }

  return NextResponse.json(topic);
}
