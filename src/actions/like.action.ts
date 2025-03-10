"use server";

import db from "@/lib/db";
import { getDbUserId } from "./user.action";

export async function toggleLike({ postId }: { postId: string }) {
  const userId = await getDbUserId();
  if (!userId) return;

  // if like exists
  const existingLike = await db.like.findFirst({
    where: {
      userId,
      postId,
    },
  });

  const post = await db.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) throw new Error("Post not found.");

  if (existingLike) {
    // unlike
    await db.like.delete({
      where: {
        id: existingLike.id,
      },
    });
  } else {
    // like
    await db.like.create({
      data: {
        userId,
        postId,
      },
    });
  }
}

export async function getPostLikes(postId: string) {
  const userId = await getDbUserId();
  if (!userId) return { likes: 0, isLikedByUser: false };

  const post = await db.post.findUnique({
    where: { id: postId },
    select: {
      likes: {
        where: { userId },
        select: {
          userId: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  return {
    likes: !!post?._count,
    isLikedByUser: post?.likes.some((like) => like.userId === userId),
  };
}
