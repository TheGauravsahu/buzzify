"use client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { deletePost, getPosts } from "@/actions/post.action";
import { Suspense } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export default function PostsList() {
  const {
    data: posts,
    error,
    isPending,
  } = useSuspenseQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (error) return <div>An error occured: {error.message}</div>;

  if (isPending) return <div>Loading...</div>;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ul className="mt-4 grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="flex justify-between items-center">
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
      </ul>
    </Suspense>
  );
}
