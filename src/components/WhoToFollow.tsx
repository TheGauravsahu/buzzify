"use client";
import { getRandomUsers } from "@/actions/user.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import FollowButton from "./FollowButton";
import { Skeleton } from "./ui/skeleton";

export default function WhoToFollow() {
  const {
    data: users,
    error,
    isPending,
  } = useQuery({
    queryKey: ["usersToFollow"],
    queryFn: getRandomUsers,
  });

  if (isPending)
    return (
      <Card className="w-full border h-[60vh]">
        <CardHeader>
          <CardTitle>Who to Follow</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    );

  if (error) return <div>An error occured.</div>;

  return (
    <Card className="w-full border h-[60vh]">
      <CardHeader>
        <CardTitle>Who to Follow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex">
              <div className="flex gap-2 items-center justify-between w-full">
                <div className="flex gap-2 items-center justify-between">
                  <Link href={`/profile/${user.username}`}>
                    <Avatar>
                      <AvatarImage src={user.image ?? "/avatar.png"} />
                    </Avatar>
                  </Link>

                  <div className="text-sm">
                    <Link
                      href={`/profile/${user.username}`}
                      className="font-medium cursor-pointer"
                    >
                      {user.name}
                    </Link>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-xs mb-2">
                    {user._count.followers} followers
                  </p>
                  <FollowButton targetUserId={user.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
