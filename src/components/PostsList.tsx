"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosts } from "@/actions/post.action";
import InfiniteScroll from "react-infinite-scroll-component";
import { Skeleton } from "./ui/skeleton";
import PostCard from "./PostCard";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";

export default function PostsList() {
  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 0 }) => getPosts({ pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "error") return <div>An error occured.</div>;

  if (status === "pending") return <PostsListSkeleton />;

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<PostsListSkeleton />}
      endMessage={<h3>You reached the end.</h3>}
    >
      <div className="flex flex-1 flex-col gap-8 overflow-hidden w-full h-full   mx-auto">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </InfiniteScroll>
  );
}

const PostsListSkeleton = () => {
  const skeletonCount = [1, 2];

  return (
    <div className="flex flex-col gap-8 mt-8 justify-center md:justify-normal md:items-start items-center  w-full  mx-auto">
      {skeletonCount.map((i) => (
        <Card key={i} className="w-full">
          {/* topbar */}
          <CardHeader>
            <div className="flex gap-4 md:gap-0 justify-between items-center p-4">
              {/* user profile */}
              <div className="flex gap-4 items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              {/* other info */}
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="h-80 mb-4">
              <Skeleton className="relative h-full w-full overflow-hidden rounded-none" />
            </div>
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px] my-2" />
          </CardContent>

          <CardFooter className="flex flex-col items-start gap-2">
            <div className="my-2  flex  gap-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-12" />
            </div>

            <div className="w-full flex items-center gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
