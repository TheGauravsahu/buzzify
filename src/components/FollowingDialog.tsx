"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Skeleton } from "./ui/skeleton";
import { getProfileFollowingsById } from "@/actions/profile.action";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import FollowButton from "./FollowButton";

export default function FollowingDialog({
  children,
  userId,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();

  const {
    data: followings,
    isPending,
    error,
  } = useQuery({
    queryKey: ["followings", userId],
    queryFn: () => getProfileFollowingsById(userId),
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
          <DialogTitle>Followings</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col gap-4">
              {followings?.map((user) => (
                <div
                  key={user.id}
                  className="flex gap-2 items-center justify-between w-full"
                >
                  <div className="flex gap-2 items-center justify-between">
                    <Link href={`/profile/${user.following.username}`}>
                      <Avatar>
                        <AvatarImage
                          src={user.following.image ?? "/avatar.png"}
                        />
                      </Avatar>
                    </Link>

                    <div className="text-sm flex flex-col items-start">
                      <Link
                        href={`/profile/${user.following.username}`}
                        className="font-medium cursor-pointer"
                      >
                        {user.following.name}
                      </Link>
                      <p className="text-muted-foreground">
                        @{user.following.username}
                      </p>
                    </div>
                  </div>

                  <div>
                    <FollowButton targetUserId={user.following.id} />
                  </div>
                </div>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
