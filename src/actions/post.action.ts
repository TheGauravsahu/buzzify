"use server";

import db from "@/lib/db";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(description: string, image: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const post = await db.post.create({
      data: {
        description,
        image,
        authorId: userId,
      },
    });

    revalidatePath("/");

    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getPosts() {
  try {
    const posts = await db.post.findMany({
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

export async function toggelLike(postId: string) {
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

export async function creatComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

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

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deletePost(postId: string) {
  try {
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
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}
