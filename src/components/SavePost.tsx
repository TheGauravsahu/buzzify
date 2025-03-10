"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import LoadingButton from "./LoadingButton";
import { getSavedPostDetails, toggleSavePost } from "@/actions/post.action";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

export default function SavePost({ postId }: { postId: string }) {
  const queryClient = useQueryClient();

  const mutatiton = useMutation({
    mutationFn: toggleSavePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
      queryClient.invalidateQueries({ queryKey: ["savedPosts", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: savedPost } = useSuspenseQuery({
    queryKey: ["savedPosts", postId],
    queryFn: () => getSavedPostDetails(postId),
  });

  const session = useClerk();

  return (
    <LoadingButton
      variant="outline"
      isPending={mutatiton.isPending}
      onClick={() => {
        mutatiton.mutate(postId);
      }}
    >
      <div className="flex items-center gap-1">
        <Bookmark
          fill={savedPost?.user.clerkId === session.user?.id ? "white" : "none"}
        />
        Save
      </div>
    </LoadingButton>
  );
}
