"use client";

import { getProfileByUsername } from "@/actions/profile.action";
import FollowButton from "@/components/FollowButton";
import FollowerDialog from "@/components/FollowerDialog";
import FollowingDialog from "@/components/FollowingDialog";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useQuery } from "@tanstack/react-query";
import { LinkIcon, MapPinIcon } from "lucide-react";
import EditProfileDialog from "./edit-profile";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Profile({ username }: { username: string }) {
  const {
    data: user,
    isPending,
    error,
  } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => getProfileByUsername(username),
  });

  const session = useUser();

  if (error) return <div>An error occured.</div>;

  // skeleton
  if (isPending) return <ProfileSkeleton />;

  return (
    <Card className="w-full">
      <CardContent>
        <div className="flex flex-col md:flex-row md:gap-16 gap-4 md:items-center justify-center">
          <div className="flex md:gap-16 gap-8 items-start md:items-center">
            <Avatar className="md:w-28 md:h-28 h-20 w-20">
              <AvatarImage src={user?.image ?? "/avatar.png"} />
            </Avatar>

            <div>
              <div className="flex md:flex-row flex-col md:items-end gap-4">
                <h1 className="md:mt-4 text-2xl font-bold">{user?.username}</h1>
                {session.isSignedIn ? (
                  <FollowButton targetUserId={user?.id as string} />
                ) : (
                  <SignInButton mode="modal">
                    <Button variant="default" className="cursor-pointer">
                      Sign In
                    </Button>
                  </SignInButton>
                )}
                {user?.clerkId === session.user?.id && (
                  <EditProfileDialog username={username} />
                )}
              </div>

              {/* PROFILE STATS */}
              <div className="w-40 my-4">
                <div className="flex justify-between mb-4 gap-1">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="font-semibold">
                      {user?._count.posts.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>

                  <Separator orientation="vertical" />
                  <FollowerDialog userId={user?.id as string}>
                    <div className="flex items-center gap-1 md:gap-2 cursor-pointer">
                      <div className="font-semibold">
                        {user?._count.followers.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Followers
                      </div>
                    </div>
                  </FollowerDialog>

                  <Separator orientation="vertical" />
                  <FollowingDialog userId={user?.id as string}>
                    <div className="flex items-center gap-1 md:gap-2 cursor-pointer">
                      <div className="font-semibold">
                        {user?._count.following.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Following
                      </div>
                    </div>
                  </FollowingDialog>
                </div>
              </div>

              {/* BASIC INFO */}
              <div>
                <h1>{user?.name}</h1>
                <p className="text-sm">{user?.bio}</p>
              </div>

              {/* LOCATION & WEBSITE */}
              <div className="w-full mt-6 space-y-2 text-sm">
                {user?.location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPinIcon className="size-4 mr-2" />
                    {user?.location}
                  </div>
                )}
                {user?.website && (
                  <div className="flex items-center text-muted-foreground">
                    <LinkIcon className="size-4 mr-2" />
                    <a
                      href={
                        user?.website.startsWith("http")
                          ? user?.website
                          : `https://${user?.website}`
                      }
                      className="hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ProfileSkeleton = () => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent>
        <div className="flex gap-16 items-center">
          <Skeleton className="h-28 w-28 rounded-full" />

          <div>
            <Skeleton className="h-8 w-36 rounded-lg" />

            <div className="w-full my-4">
              <div className="flex gap-3 justify-between mb-4">
                <Skeleton className="h-4 w-32" />
                <Separator orientation="vertical" />
                <Skeleton className="h-4 w-32" />
                <Separator orientation="vertical" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* BASIC INFO */}
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
