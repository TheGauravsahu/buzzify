"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Post, User, Comment } from "@prisma/client";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment, deletePost } from "@/actions/post.action";
import { toast } from "sonner";
import { Avatar, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { formatDate } from "@/lib/utils";
import { Heart, MessageCircle, SendIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";

type PostWithRelations = Post & {
  author: Pick<User, "id" | "name" | "image" | "username">;
  comments: (Comment & {
    author: Pick<User, "id" | "name" | "image" | "username">;
  })[];
  likes: { userId: string }[];
  _count: {
    likes: number;
    comments: number;
  };
};

export default function PostCard({ post }: { post: PostWithRelations }) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // delete post mutation
  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-10 sm:h-10">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>
            <div className="flex flex-col">
              <Link href={`/profile/${post.author.username}`}>
                <h2>{post.author.name}</h2>
              </Link>
              <h3 className="text-sm text-foreground/60">
                @{post.author.username}
              </h3>
            </div>
          </div>

          <div className="*:cursor-pointer">
            <p className="text-xs">{formatDate(post.createdAt)}</p>
            <Button
              className="mt-2"
              variant="secondary"
              onClick={() => {
                mutation.mutate(post.id);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="relative h-72 overflow-hidden">
          <Image
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            src={post.image as string}
            alt={post.title}
          />
        </div>

        <div className="p-4">
          <h1>{post.title}</h1>
          <p className="line-clamp-2">{post.description}</p>
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center w-full gap-4">
            <Button className="flex items-center gap-2">
              <Heart size={20} />
              {post._count.likes}
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
          </div>

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
                        <h2 className="text-sm text-foreground/80">{comment.author.name}</h2>
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
          <div className="w-full flex gap-4 items-center">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />

            <Button
              size="sm"
              disabled={commentMutation.isPending}
              onClick={async () => {
                await commentMutation.mutate({
                  postId: post.id,
                  content: newComment,
                });
              }}
            >
              <>
                <SendIcon className="size-4" />
                Comment
              </>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
