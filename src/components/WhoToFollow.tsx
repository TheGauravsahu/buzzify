"use client";
import { getRandomUsers } from "@/actions/user.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Loader } from "lucide-react";

export default function WhoToFollow() {
  const {
    data: users,
    error,
    isPending,
  } = useSuspenseQuery({
    queryKey: ["usersToFollow"],
    queryFn: getRandomUsers,
  });

  if (error) return <div>An error occured.</div>;

  if (isPending)
    return (
      <div className="flex items-center gap-2">
        <Loader className="animate-spin w-5 h-5" />
        Loading
      </div>
    );

  return (
    <Card className="w-full border h-[60vh]">
      <CardHeader>
        <CardTitle>Who to Follow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length > 0 ? (
            users.map((user) => (
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

                  <p className="text-muted-foreground text-xs">
                    {user._count.followers} followers
                  </p>
                </div>
              </div>
            ))
          ) : (
            <span className="text-foreground/80">No users to follow.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
