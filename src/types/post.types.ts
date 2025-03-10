import { Comment, Post, User } from "@prisma/client";

export type PostWithRelations = Post & {
  author: Pick<User, "id" | "name" | "image" | "username" | "clerkId">;
  comments: (Comment & {
    author: Pick<User, "id" | "name" | "image" | "username">;
  })[];
  likes: { userId: string; user: Pick<User, "clerkId"> }[];
  saved: { userId: string; user: Pick<User, "clerkId"> }[];
  _count: {
    likes: number;
    comments: number;
  };
};
