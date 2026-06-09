import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_TYPES = [
  "INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP",
];

export async function POST(req: Request) {
  try {
    const { username, mbtiType } = await req.json();

    if (!username?.trim()) {
      return NextResponse.json({ error: "请输入用户名" }, { status: 400 });
    }

    if (username.length > 30) {
      return NextResponse.json({ error: "用户名不能超过 30 个字符" }, { status: 400 });
    }

    if (!VALID_TYPES.includes(mbtiType)) {
      return NextResponse.json({ error: "请选择有效的 MBTI 类型" }, { status: 400 });
    }

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { username: username.trim() },
      include: { mbtiProfile: true },
    });

    if (user) {
      // 已有用户 — 如果还没选 MBTI 就设置
      if (!user.mbtiProfile) {
        await prisma.mbtiProfile.create({
          data: { userId: user.id, mbtiType },
        });
        // 重新查询以获取新创建的 profile
        user = await prisma.user.findUnique({
          where: { id: user.id },
          include: { mbtiProfile: true },
        })!;
      }
      // 已选过 MBTI 则直接登录（不覆盖已有类型）
    } else {
      // 全新用户
      const newUser = await prisma.user.create({
        data: { username: username.trim() },
      });
      await prisma.mbtiProfile.create({
        data: { userId: newUser.id, mbtiType },
      });
      user = await prisma.user.findUnique({
        where: { id: newUser.id },
        include: { mbtiProfile: true },
      })!;
    }

    const existingMbti = user!.mbtiProfile?.mbtiType || mbtiType;

    const res = NextResponse.json({
      success: true,
      user: { id: user!.id, username: user!.username, mbtiType: existingMbti },
    });

    // 设置 cookie（7 天过期）
    res.cookies.set("mbti_user_id", user!.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("onboard error:", err);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
