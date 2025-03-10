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
          clerkId: true,
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

export const getPostById = async (postId: string) => {
  const post = await db.post.findUnique({
    where: { id: postId },
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
        include: {
          // post -> comment -> author
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
      // post -> likes
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

  return post;
};

export async function getCurrentUserPosts() {
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
          include: {
            // post -> comment -> author
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
  if (!postId) throw Error("Post Id is required.");
  return await db.saved.findFirst({
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
          image: true,
          author: {
            select: {
              id: true,
              image: true,
              clerkId: true,
            },
          },
        },
      },
    },
  });
}

export async function getUserSavedPosts({
  pageParam = 0,
  userId,
}: {
  pageParam: number;
  userId: string;
}) {
  if (!userId) return { posts: [], nextPage: null };

  const pageSize = 3;

  const saved = await db.saved.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: pageSize,
    skip: pageParam * pageSize,
    select: {
      post: {
        select: {
          id: true,
          title: true,
          image: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
    },
  });

  const posts = saved.flatMap((post) => post.post);

  return {
    posts,
    nextPage: posts.length === pageSize ? pageParam + 1 : null,
  };
}

export async function deletePost(postId: string) {
  const userId = await getDbUserId();
  if (!userId) throw new Error("Login to delete this post.");

  const post = await db.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) throw new Error("Post not found");

  if (post.authorId !== userId)
    throw new Error("Unauthorized - You can not delete others posts.");

  await db.post.delete({
    where: { id: postId },
  });

  revalidatePath("/");
  return { success: true };
}
