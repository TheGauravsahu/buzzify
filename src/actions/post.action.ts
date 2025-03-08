"use server";

import db from "@/lib/db";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { CreatePostData } from "@/components/CreatePost";

export async function createPost({
  title,
  description,
  image,
}: CreatePostData) {
  const userId = await getDbUserId();
  if (!userId) throw Error("Please Login to create a post.");

  const post = await db.post.create({
    data: {
      title,
      description,
      image,
      authorId: userId,
    },
  });

  return post;
}

export async function getPosts({ pageParam = 0 }) {
  const pageSize = 4;

  const posts = await db.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: pageSize,
    skip: pageParam * pageSize,
    include: {
      // author -> post
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
        },
      },
      // comment -> post
      comments: {
        include: {
          // author -> post -> comments
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
      // likes -> post
      likes: {
        select: {
          userId: true,
          user: {
            select: {
              clerkId: true,
            },
          },
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

export async function getUserPosts() {
  const userId = await getDbUserId();
  if (!userId) return;

  try {
    const posts = await db.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        // author -> post
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        // comment -> post
        comments: {
          include: {
            // author -> post -> comments
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
        // likes -> post
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
  } catch (error) {
    console.log("Error in getPosts", error);
    throw new Error("Failed to fetch posts");
  }
}

export async function toggleLike({ postId }: { postId: string }) {
  try {
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

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function createComment({
  postId,
  content,
}: {
  postId: string;
  content: string;
}) {
  const userId = await getDbUserId();
  if (!userId) throw Error("Please Login to create a post.");

  if (!content) throw new Error("Content is required.");

  const post = await db.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) throw new Error("Post not found");

  const comment = await db.comment.create({
    data: {
      content,
      authorId: userId,
      postId,
    },
  });

  return { success: true, comment };
}

export async function deletePost(postId: string) {
  const userId = await getDbUserId();

  const post = await db.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) throw new Error("Post not found");
  if (post.authorId !== userId)
    throw new Error("Unauthorized - no delete permission");

  await db.post.delete({
    where: { id: postId },
  });

  revalidatePath("/");
  return { success: true };
}
