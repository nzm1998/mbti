import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = [
  "INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP",
];

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先设置用户名和 MBTI 类型" }, { status: 401 });
  }

  const { mbtiType } = await req.json();

  if (!VALID_TYPES.includes(mbtiType)) {
    return NextResponse.json({ error: "无效的 MBTI 类型" }, { status: 400 });
  }

  const existing = await prisma.mbtiProfile.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    return NextResponse.json(
      { error: `你已经是 ${existing.mbtiType}，无法更改` },
      { status: 409 }
    );
  }

  await prisma.mbtiProfile.create({
    data: { userId: user.id, mbtiType },
  });

  return NextResponse.json({ success: true, mbtiType });
}
