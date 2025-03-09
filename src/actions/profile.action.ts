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

export async function getUserPosts(username: string) {
  if (!username) return [];

  const posts = await db.post.findMany({
    where: {
      author: {
        username,
      },
    },
    include: {
      // post -> author
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        },
      },
      // post -> comment
      comments: {
        orderBy: {
          createdAt: "asc",
        },
      },
      // post -> likes
      likes: {
        select: {
          userId: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  return posts;
}
