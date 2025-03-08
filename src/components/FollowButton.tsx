"use client";

import { checkIfFollowing, toggleFollow } from "@/actions/user.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingButton from "./LoadingButton";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

export default function FollowButton({
  targetUserId,
}: {
  targetUserId: string;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ["follow", targetUserId],
    mutationFn: toggleFollow,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["usersToFollow"],
      });
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
      queryClient.invalidateQueries({
        queryKey: ["followStatus", targetUserId],
      });
    },
    onError: (error, _, context) => {
      toast.error((error as Error).message);
    },
  });

  const { data: isFollowing, isPending } = useQuery({
    queryKey: ["followStatus", targetUserId],
    queryFn: () => checkIfFollowing(targetUserId),
    staleTime: 60 * 1000, // Cache for 1 min
  });

  if (isPending) return <Skeleton className="w-16 h-8" />;

  return (
    <LoadingButton
      isPending={mutation.isPending || isPending}
      onClick={() => mutation.mutate(targetUserId)}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </LoadingButton>
  );
}
