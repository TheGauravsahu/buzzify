"use client";

import { createComment } from "@/actions/post.action";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/general/LoadingButton";
import { SignInButton, useUser } from "@clerk/nextjs";
import { SendIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function AddComment({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const user = useUser();

  const queryKey: QueryKey = ["comment", postId];

  const { mutate, isPending } = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return (
    <div className="w-full flex gap-4 items-center p-2">
      <Textarea
        placeholder="Write a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="min-h-[80px] resize-none"
      />

      {user.isSignedIn ? (
        <LoadingButton
          isPending={isPending}
          onClick={async () => {
            await mutate({
              postId,
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
            <SendIcon className="size-4" />
            Comment
          </Button>
        </SignInButton>
      )}
    </div>
  );
}
