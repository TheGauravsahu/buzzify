import { getProfileByUsername } from "@/actions/profile.action";
import React from "react";
import Profile from "./_components/profile";
import ProfilePosts from "./_components/posts";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, Bookmark } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await getProfileByUsername(username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username} - Buzzify`,
    description: user.bio || `Check out ${user.username}'s profile on Buzzify.`,
  };
}

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  return (
    <div className="max-w-4xl mx-auto">
      <Profile username={username} />
      <div className="my-8">
        <Separator orientation="horizontal" />

        <Tabs defaultValue="posts" className="w-full mt-2">
          <TabsList className="w-36 mx-auto gap-8 rounded-none h-auto p-0 bg-transparent *:cursor-pointer">
            <TabsTrigger value="posts">
              <Grid />
              Posts
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Bookmark />
              Saved
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts">
            <ProfilePosts username={username} />
          </TabsContent>
          <TabsContent value="saved">Change your password here.</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
