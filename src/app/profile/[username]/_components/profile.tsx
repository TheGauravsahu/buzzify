"use client";

import { getProfileByUsername } from "@/actions/profile.action";
import FollowButton from "@/components/FollowButton";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useQuery } from "@tanstack/react-query";

export default function Profile({ username }: { username: string }) {
  const {
    data: user,
    isPending,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfileByUsername(username),
  });

  if (error) return <div>An error occured.</div>;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent>
        <div className="flex gap-16 items-center">
          <Avatar className="w-28 h-28">
            <AvatarImage src={user?.image ?? "/avatar.png"} />
          </Avatar>

          <div>
            <div className="flex items-end gap-4">
              <h1 className="mt-4 text-2xl font-bold">{user?.username}</h1>
              <FollowButton targetUserId={user?.id as string} />
            </div>

            {/* PROFILE STATS */}
            <div className="w-full my-4">
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    {user?._count.posts.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>

                <Separator orientation="vertical" />
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    {user?._count.followers.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <Separator orientation="vertical" />
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    {user?._count.following.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
              </div>
            </div>

            {/* BASIC INFO */}
            <div>
              <h1>{user?.name}</h1>
              <p className="text-sm">{user?.bio}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
