"use server";

import db from "@/lib/db";
import { getDbUserId } from "./user.action";

export async function toggleFollow(targetUserId: string) {
  const userId = await getDbUserId();
  if (!userId) throw new Error("Login to follow.");

  if (userId === targetUserId) throw new Error("You cannot follow yourself");

  const existingFollow = await db.follows.findFirst({
    where: {
      followerId: userId,
      followingId: targetUserId,
    },
  });

  if (existingFollow) {
    // unfollow
    await db.follows.delete({
      where: {
        id: existingFollow.id,
      },
    });
  } else {
    // follow
    await db.follows.create({
      data: {
        followerId: userId,
        followingId: targetUserId,
      },
    });
  }
}

export async function checkIfFollowing(targetUserId: string) {
  const userId = await getDbUserId();
  if (!userId) return { isFollowed: false };

  const existingFollow = await db.follows.findFirst({
    where: {
      followerId: userId,
      followingId: targetUserId,
    },
  });

  return { isFollowed: Boolean(existingFollow) };
}
