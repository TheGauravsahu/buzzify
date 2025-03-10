"use client";

import { getPostLikes, toggleLike } from "@/actions/like.action";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";

interface LikeButtonProps {
  postId: string;
  initialState: InitialState;
}

interface InitialState {
  likes: number;
  isLikedByUser: boolean;
}

export default function LikeButton({ initialState, postId }: LikeButtonProps) {
  const user = useUser();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["like-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () => getPostLikes(postId),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: toggleLike,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<InitialState>(queryKey);

      queryClient.setQueryData<InitialState>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

      return { previousState };
    },
    onError: (error, _, context) => {
      console.log(error);
      queryClient.setQueryData(queryKey, context?.previousState);
      toast.error(error.message);
    },
  });

  return (
    <>
      {user.isSignedIn ? (
        <Button
          onClick={async () => {
            mutate({
              postId,
            });
          }}
          variant="outline"
          className={
            data?.isLikedByUser
              ? "text-red-500 hover:text-red-600"
              : "hover:text-red-500"
          }
        >
          <Heart size={20} className="fill-current" />
          <span className="dark:text-white text-black"> {data?.likes} </span>
        </Button>
      ) : (
        <SignInButton mode="modal">
          <Button variant="outline" className="cursor-pointer">
            <Heart size={20} className="fill-current" />
            <span className="dark:text-white text-black"> {data?.likes} </span>
          </Button>
        </SignInButton>
      )}
    </>
  );
}
