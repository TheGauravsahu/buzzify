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

export default function PostsList() {
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 0 }) => getPosts({ pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  console.log(data);

  const posts = data?.pages.flatMap((page) => page.posts) || [];

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

  if (status === "pending") return <div>Loading...</div>;

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<h4>Loading more posts.</h4>}
      endMessage={<h3>All Posts Loaded!</h3>}
    >
      <div className="flex flex-wrap gap-4 min-h-screen">
        {posts.map((post) => (
          <div key={post.id} className="h-96 w-96 border p-4">
            <li>{post.title}</li>
            <Button
              disabled={mutation.isPending}
              variant="link"
              onClick={() => {
                mutation.mutate(post.id);
              }}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </InfiniteScroll>
  );
}
