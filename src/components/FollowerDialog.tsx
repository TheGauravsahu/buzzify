"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React from "react";
import { Skeleton } from "./ui/skeleton";
import { getProfileFollowersById } from "@/actions/profile.action";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import FollowButton from "./FollowButton";
import { checkIfFollowing } from "@/actions/follow.action";

export default function FollowerDialog({
  children,
  userId,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const {
    data: followers,
    isPending,
    error,
  } = useQuery({
    queryKey: ["followers", userId],
    queryFn: () => getProfileFollowersById(userId),
  });

   // Fetch `isFollowed` status for each follower **before rendering**
   const followStatuses = useQueries({
    queries:
      followers?.map((user) => ({
        queryKey: ["follow-user", user.id],
        queryFn: () => checkIfFollowing(user.id),
        enabled: !!user.id,
      })) || [],
  });

  if (isPending)
    return (
      <Dialog>
        <DialogTrigger>{children}</DialogTrigger>
        <DialogContent>
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );

  if (error) return <div>An error occured. {error.message}</div>;

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ["followings", userId] });
  };

 

  return (
    <Dialog>
      <DialogTrigger onClick={handleRefetch}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Followers</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col gap-4">
              {followers?.map((user, index) => {
                const followStatus = followStatuses[index]?.data;

                return (
                  <div
                    key={user.id}
                    className="flex gap-2 items-center justify-between w-full"
                  >
                    <div className="flex gap-2 items-center justify-between">
                      <Link
                        prefetch={true}
                        href={`/profile/${user.follower.username}`}
                      >
                        <Avatar>
                          <AvatarImage
                            src={user.follower.image ?? "/avatar.png"}
                          />
                        </Avatar>
                      </Link>

                      <div className="text-sm flex flex-col items-start">
                        <Link
                          href={`/profile/${user.follower.username}`}
                          className="font-medium cursor-pointer"
                        >
                          {user.follower.name}
                        </Link>
                        <p className="text-muted-foreground">
                          @{user.follower.username}
                        </p>
                      </div>
                    </div>

                    <div>
                      <FollowButton
                        targetUserId={user.id}
                        initialState={{
                          isFollowed: followStatus?.isFollowed ?? false,
                        }}
                        username={user.follower.username}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
