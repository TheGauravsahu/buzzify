"use client";

import { QueryKey, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Avatar, AvatarImage } from "../ui/avatar";
import { getPostsComments } from "@/actions/comment.action";
import { User, Comment } from "@prisma/client";

export interface CommentWithAuthor extends Comment {
  author: Pick<User, "id" | "name" | "image" | "username">;
}

export default function CommentList({
  postId,
  initialState = [],
}: {
  postId: string;
  initialState: CommentWithAuthor[];
}) {
  const queryKey: QueryKey = ["comment", postId];

  const { data: comments } = useQuery({
    queryKey,
    queryFn: () => getPostsComments(postId),
    initialData: initialState,
    staleTime: 20,
  });

  return (
    <div className="mt-4 space-y-4">
      {comments?.length > 0 ? (
        comments?.map((comment) => (
          <div key={comment.id} className="flex items-center gap-4">
            <Link href={`/profile/${comment.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={comment.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>
            <div>
              <Link href={`/profile/${comment.author.username}`}>
                <h2 className="text-sm text-foreground/80">
                  {comment.author.name}
                </h2>
              </Link>
              <p>{comment.content}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
}
