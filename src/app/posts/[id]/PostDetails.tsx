"use client";
import { getPostById } from "@/actions/post.action";
import AddComment from "@/components/post/interections/comment/AddComment";
import CommentList from "@/components/post/interections/comment/CommentList";
import LikeButton from "@/components/post/interections/like/LikeButton";
import SavePost from "@/components/post/interections/save/SavePost";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function PostDetails({ postId }: { postId: string }) {
  const user = useUser();
  const {
    data: post,
    error,
    isPending,
  } = useQuery({
    queryKey: ["posts", postId],
    queryFn: () => getPostById(postId),
  });

  if (error) return <div>An error occured {error.message}</div>;

  if (isPending) return <PostDetailsSkeleton />;

  if (!post) return notFound();

  return (
    <div className="w-full md:w-4xl mx-auto flex flex-col md:flex-row items-center h-full border">
      {/* POST IMAGE */}
      <div className="border w-full h-full md:h-full overflow-hidden aspect-square bg-primary/10">
        <Image
          priority
          src={post.image as string}
          alt={post.title}
          width={600}
          height={1200}
          className="object-cover h-full w-full"
        />
      </div>

      {/* RIGHT -> POST INFORMATION */}
      <div className="border w-full md:w-1/2 h-full flex flex-col justify-between">
        {/* Post -> Author(user) */}
        <div className="flex justify-between items-center md:border-b p-2">
          <div className="flex items-center gap-2">
            <Link prefetch={true} href={`/profile/${post.author.username}`}>
              <Avatar className="size-8 sm:w-8 sm:h-8">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>
            <div className="flex flex-col">
              <Link prefetch={true} href={`/profile/${post.author.username}`}>
                <p className="text-sm">{post.author.name}</p>
              </Link>
              <p className="text-xs text-foreground/60">
                @{post.author.username}
              </p>
            </div>
          </div>

          <div className="*:cursor-pointer">
            <p className="text-xs mb-2">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {/* Post Info */}
        <div className="p-4">
          <h1>{post.title}</h1>
          <p className="text-sm text-muted-foreground">{post.description}</p>
        </div>

        {/* COMMENT LIST/SECTION */}
        <div className="h-[60%] p-2">
          <CommentList postId={post.id} initialState={post.comments} />
        </div>

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
            <Button className="flex items-center gap-2" variant="outline">
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

          {/* ADD COMMENT */}
          <AddComment postId={post.id} />
        </div>
      </div>
    </div>
  );
}

const PostDetailsSkeleton = () => {
  return (
    <div className="w-full md:w-4xl mx-auto flex flex-col md:flex-row items-center h-full">
      {/* POST IMAGE */}
      <Skeleton className="border w-full md:w-[70%] h-full overflow-hidden aspect-square" />

      {/* RIGHT -> POST INFORMATION */}
      <div className="border w-full md:w-1/2 h-full">
        {/* Post -> Author(user) */}
        <div className="flex justify-between items-center md:border-b p-2">
          <div className="flex gap-4 items-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>

        {/* Post Info */}
        <div className="p-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px] my-2" />
        </div>

        {/* COMMENT LIST/SECTION */}
        <div className="mt-4 space-y-4 h-[30%] md:h-[45vh] overflow-y-auto scrollbar-hide  p-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ))}
        </div>

        {/* POST INTERECTIONS */}
        <div className="border-t flex items-center  gap-2 p-2">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
        </div>

        {/* ADD COMMENT */}
        <div className="w-full flex gap-2 items-center p-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
};
