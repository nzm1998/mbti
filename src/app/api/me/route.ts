import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/user";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      mbtiType: user.mbtiProfile?.mbtiType || null,
    },
  });
}
