"use client";
import { checkIfFollowing, toggleFollow } from "@/actions/follow.action";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { ProfileWithCounts } from "@/types/profile.types";

interface FollowButtonProps {
  targetUserId: string;
  username: string;
  initialState: InitialState;
}
interface InitialState {
  isFollowed: boolean;
}

export default function FollowButton({
  targetUserId,
  initialState,
  username,
}: FollowButtonProps) {
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["follow-user", targetUserId];

  const { data, isPending } = useQuery({
    queryKey,
    queryFn: () => checkIfFollowing(targetUserId),
    staleTime: Infinity,
    initialData: initialState,
  });

  const { mutate } = useMutation({
    mutationFn: toggleFollow,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<InitialState>(queryKey);

      queryClient.setQueryData(queryKey, {
        isFollowed: !previousState?.isFollowed,
      });

      // update follower count in profile
      queryClient.setQueryData(
        ["profile", username],
        (oldData: ProfileWithCounts) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            _count: {
              ...oldData._count,
              followers:
                oldData._count.followers + (previousState?.isFollowed ? -1 : 1),
            },
          };
        }
      );

      return { previousState };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context?.previousState);
      toast.error(error.message);
    },
  });

  if (isPending) return <Skeleton className="w-16 h-8" />;

  return (
    <Button onClick={() => mutate(targetUserId)}>
      {data.isFollowed ? "Unfollow" : "Follow"}
    </Button>
  );
}
