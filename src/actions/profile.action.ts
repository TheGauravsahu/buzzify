"use server";

import db from "@/lib/db";
import { getDbUserId } from "./user.action";

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

export async function getUserPosts({
  username,
  pageParam = 0,
}: {
  username: string;
  pageParam: number;
}) {
  if (!username) return { posts: [], nextPage: null };

  const pageSize = 6;

  const posts = await db.post.findMany({
    where: {
      author: {
        username,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: pageSize,
    skip: pageParam * pageSize,
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

  return { posts, nextPage: posts.length === pageSize ? pageParam + 1 : null };
}

export async function getProfileFollowingsById(userId: string) {
  if (!userId) return [];

  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      following: {
        include: {
          following: true,
        },
      },
    },
  });

  return user?.following;
}

export async function getProfileFollowersById(userId: string) {
  if (!userId) return [];

  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      followers: {
        include: {
          follower: true,
        },
      },
    },
  });

  return user?.followers;
}

export async function editProfile({
  name,
  username,
  bio,
  website,
  location,
}: {
  name: string;
  username: string;
  bio: string;
  website: string;
  location: string;
}) {
  const userId = await getDbUserId();
  if (!userId) throw new Error("Login to edit your profile.");



  const user = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
      username,
      bio,
      website,
      location,
    },
  });

  return user;
}
