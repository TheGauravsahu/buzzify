"use server";

import db from "@/lib/db";

export async function getProfileByUsername(username: string) {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  return user;
}
