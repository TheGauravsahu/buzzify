"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Post, User, Comment } from "@prisma/client";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment, deletePost, toggleLike } from "@/actions/post.action";
import { toast } from "sonner";
import { Avatar, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { formatDate } from "@/lib/utils";
import { Heart, MessageCircle, SendIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import LoadingButton from "./LoadingButton";
import { SignInButton, useUser } from "@clerk/nextjs";
import SavePost from "./SavePost";

type PostWithRelations = Post & {
  author: Pick<User, "id" | "name" | "image" | "username" | "clerkId">;
  comments: (Comment & {
    author: Pick<User, "id" | "name" | "image" | "username">;
  })[];
  likes: { userId: string; user: Pick<User, "clerkId"> }[];
  _count: {
    likes: number;
    comments: number;
  };
};

export default function PostCard({ post }: { post: PostWithRelations }) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const user = useUser();

  // delete post mutation
  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", post.id] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // add a comment
  const commentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      setNewComment("");
      setShowComments(true);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // toggle like
  const toggleLikeMutation = useMutation({
    mutationFn: toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Card key={post.id} className="w-full overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link prefetch={true} href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>
            <div className="flex flex-col">
              <Link prefetch={true} href={`/profile/${post.author.username}`}>
                <h2>{post.author.name}</h2>
              </Link>
              <h3 className="text-sm text-foreground/60">
                @{post.author.username}
              </h3>
            </div>
          </div>

          <div className="*:cursor-pointer">
            <p className="text-xs mb-2">{formatDate(post.createdAt)}</p>
            {user.user?.id === post.author.clerkId && (
              <LoadingButton
                variant="secondary"
                isPending={mutation.isPending}
                onClick={() => {
                  mutation.mutate(post.id);
                }}
              >
                Delete
              </LoadingButton>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="relative h-96 overflow-hidden bg-secondary rounded-lg">
          <Image
            fill
            priority={true}
            className="object-cover hover:scale-105 cursor-pointer transition-transform duration-300"
            src={post.image as string}
            alt={post.title}
          />
        </div>

        <div className="p-4">
          <h1>{post.title}</h1>
          <p className="line-clamp-2">{post.description}</p>
        </div>
      </CardContent>

      {/* POST INTERECTION */}
      <CardFooter>
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center w-full gap-4">
            {/* Like Button */}
            <Button
              disabled={toggleLikeMutation.isPending}
              onClick={async () => {
                await toggleLikeMutation.mutate({
                  postId: post.id,
                });
              }}
              variant="outline"
              className={
                post.likes.some((like) => like.user.clerkId === user.user?.id)
                  ? "text-red-500 hover:text-red-600"
                  : "hover:text-red-500"
              }
            >
              <Heart size={20} className="fill-current" />
              <span className="dark:text-white text-black">
                {post._count.likes}
              </span>
            </Button>

            {/* Comment Button */}
            <Button
              className="flex items-center gap-2"
              variant="outline"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle size={20} />
              {post._count.comments}
            </Button>

            {/* Save Post */}
            <SavePost postId={post.id} />
          </div>

          {/* COMMENT LIST/SECTION */}
          {showComments && (
            <div className="mt-4 space-y-4">
              {post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-center gap-4">
                    <Link href={`/profile/${comment.author.username}`}>
                      <Avatar className="size-8 sm:w-10 sm:h-10">
                        <AvatarImage
                          src={comment.author.image ?? "/avatar.png"}
                        />
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
          )}

          {/* ADD COMMENT */}
          <div className="w-full flex gap-4 items-center">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />

            {user.isSignedIn ? (
              <LoadingButton
                isPending={commentMutation.isPending}
                onClick={async () => {
                  await commentMutation.mutate({
                    postId: post.id,
                    content: newComment,
                  });
                }}
              >
                <SendIcon className="size-4" />
                Comment
              </LoadingButton>
            ) : (
              <SignInButton mode="modal">
                <Button variant="default" className="cursor-pointer">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
