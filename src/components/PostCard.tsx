"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "@/actions/post.action";
import { toast } from "sonner";
import { Avatar, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { formatDate } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import LoadingButton from "./LoadingButton";
import { useUser } from "@clerk/nextjs";
import SavePost from "./post/SavePost";
import { PostWithRelations } from "@/types/post.types";
import LikeButton from "./post/LikeButton";
import CommentList from "./post/CommentList";
import AddComment from "./post/AddComment";

export default function PostCard({ post }: { post: PostWithRelations }) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);

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
            <LikeButton
              postId={post.id}
              initialState={{
                likes: post._count.likes,
                isLikedByUser: post.likes.some(
                  (like) => like.user.clerkId === user.user?.id
                ),
              }}
            />

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
            <SavePost
              postId={post.id}
              initialState={{
                isSavedByUser: post.saved.some(
                  (saved) => saved.user.clerkId === user.user?.id
                ),
              }}
            />
          </div>

          {/* COMMENT LIST/SECTION */}
          {showComments && (
            <CommentList postId={post.id} initialState={post.comments} />
          )}

          {/* ADD COMMENT */}
          <AddComment postId={post.id} />
        </div>
      </CardFooter>
    </Card>
  );
}
