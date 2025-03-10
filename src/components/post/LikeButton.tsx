"use client";

import { getPostLikes } from "@/actions/like.action";
import { toggleLike } from "@/actions/post.action";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface LikeButtonProps {
  postId: string;
  initialState: InitialState;
}

interface InitialState {
  likes: number;
  isLikedByUser: boolean;
}

export default function LikeButton({ initialState, postId }: LikeButtonProps) {
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["like-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () => getPostLikes(postId),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: toggleLike,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<InitialState>(queryKey);

      queryClient.setQueryData<InitialState>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
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
  );
}
