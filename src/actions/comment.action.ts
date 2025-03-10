"use server";

import db from "@/lib/db";

export async function getPostsComments(postId: string) {
  if (!postId) throw new Error("Post Id is required.");

  const post = await db.post.findUnique({
    where: { id: postId },
    select: {
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!post) throw new Error("Post not found.");

  return post.comments;
}
