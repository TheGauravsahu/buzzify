import { getProfileByUsername } from "@/actions/profile.action";
import React from "react";
import Profile from "./_components/profile";

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
    <div>
      <Profile username={username} />
    </div>
  );
}
