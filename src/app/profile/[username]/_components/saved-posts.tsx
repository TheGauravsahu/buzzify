"use client";

import { getUserSavedPosts } from "@/actions/post.action";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

export default function SavedPosts({ userId }: { userId: string }) {
  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["savedPosts"],
    queryFn: ({ pageParam = 0 }) => getUserSavedPosts({ pageParam, userId }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") return <SavedPostSkeleton />;

  if (status === "error") return <div>An error occured.</div>;

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<SavedPostSkeleton />}
      endMessage={
        <h3 className="text-center text-muted-foreground">No saved posts.</h3>
      }
    >
      <div className="my-4 flex items-center justify-center  gap-2 *:cursor-pointer flex-wrap">
        {posts?.map((post) => (
          <Link prefetch={true} key={post.id} href={`/posts/${post.id}`}>
            <div className="relative group cursor-pointer aspect-square h-60 w-60 overflow-hidden">
              <Image
                src={post.image as string}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
              />
              {/* overlay */}
              <div className="absolute inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="text-white text-lg font-semibold flex items-center gap-4">
                  {/* Likes Count */}
                  <span className="flex items-center gap-1">
                    <Heart fill="white" /> {post._count.likes}
                  </span>

                  {/* Comments Count */}
                  <span className="flex items-center gap-1">
                    <MessageCircle fill="white" /> {post._count.comments}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </InfiniteScroll>
  );
}

const SavedPostSkeleton = () => {
  return (
    <div className="my-4 flex items-center justify-center gap-2 *:cursor-pointer flex-wrap">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i}>
          <Skeleton className="h-60 w-60" />
        </div>
      ))}
    </div>
  );
};
