"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deletePost, getPosts } from "@/actions/post.action";
import InfiniteScroll from "react-infinite-scroll-component";
import { Button } from "./ui/button";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

export default function PostsList() {
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 0 }) => getPosts({ pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const posts = data?.pages.flatMap((page) => page.posts) || [];
  console.log(posts);

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
      <div className="flex flex-wrap gap-8 overflow-hidden min-h-screen">
        {posts.map((post) => (
          <div
            key={post.id}
            className="group relative overflow-hidden rounded-lg border bg-card shadow-md transition-all hover:shadow-lg h-96"
          >
            <Link href={`/posts/${post.id}`}>
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  src={post.image as string}
                  alt={post.title}
                />
              </div>
            </Link>
            <div className="p-4">
              <h1>{post.title}</h1>
              <p className="line-clamp-2">{post.description}</p>

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
        ))}
      </div>
    </InfiniteScroll>
  );
}

const PostsListSkeleton = () => {
  return (
    <div className="flex flex-wrap gap-8 mt-8  w-full">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="group relative overflow-hidden rounded-lg border bg-card shadow-md transition-all hover:shadow-lg h-96"
        >
          <div>
            <Skeleton className="relative h-60 w-[310px] overflow-hidden rounded-none" />
          </div>

          <div className="p-4 ">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px] my-2" />

            <div className="my-2">
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
