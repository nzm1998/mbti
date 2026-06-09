import { cookies } from "next/headers";
import { prisma } from "./prisma";

const USER_COOKIE = "mbti_user_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_COOKIE)?.value;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mbtiProfile: true },
  });

  return user;
}

export function getUserCookieName() {
  return USER_COOKIE;
}
