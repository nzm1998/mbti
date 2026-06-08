import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const topic = await prisma.topic.findUnique({
    where: { slug: params.slug },
  });

  if (!topic) {
    return NextResponse.json({ error: "话题不存在" }, { status: 404 });
  }

  return NextResponse.json(topic);
}
