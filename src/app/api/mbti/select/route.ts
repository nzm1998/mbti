import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { mbtiType } = await req.json();

  const validTypes = [
    "INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
    "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP",
  ];
  if (!validTypes.includes(mbtiType)) {
    return NextResponse.json({ error: "无效的 MBTI 类型" }, { status: 400 });
  }

  const existing = await prisma.mbtiProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (existing) {
    return NextResponse.json(
      { error: `你已经是 ${existing.mbtiType}，无法更改` },
      { status: 409 }
    );
  }

  await prisma.mbtiProfile.create({
    data: { userId: session.user.id, mbtiType },
  });

  return NextResponse.json({ success: true, mbtiType });
}
