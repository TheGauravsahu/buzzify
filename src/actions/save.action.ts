"use server";

import db from "@/lib/db";
import { getDbUserId } from "./user.action";

export async function toggleSavePost(postId: string) {
  const userId = await getDbUserId();
  if (!userId) throw new Error("Login to save this post.");

  const saved = await db.saved.findFirst({
    where: { userId, postId },
  });

  if (saved) {
    await db.saved.delete({
      where: {
        id: saved.id,
      },
    });
  } else {
    await db.saved.create({
      data: {
        postId,
        userId,
      },
    });
  }
}

export async function getSavedPostDetails(postId: string) {
  const userId = await getDbUserId();
  if (!userId) return { isSavedByUser: false, post: null, savedBy: null };

  if (!postId) throw Error("Post Id is required.");

  const saved = await db.saved.findFirst({
    where: {
      postId,
    },
    select: {
      user: {
        select: {
          id: true,
          clerkId: true,
        },
      },
      post: {
        select: {
          id: true,
          author: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  return {
    isSavedByUser: saved?.user.id === userId,
    savedBy: saved?.user.id,
    post: saved?.post,
  };
}
