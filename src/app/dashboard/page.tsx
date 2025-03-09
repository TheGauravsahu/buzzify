import { getCurrentUserPosts } from "@/actions/post.action";
import React from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">All recent posts.</h1>

      <ListUserPosts />
    </div>
  );
}

async function ListUserPosts() {
  const posts = await getCurrentUserPosts();

  if (!posts) {
    return <div>No posts yet.</div>;
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-4">
      {posts.map((post) => (
        <pre className="whitespace-pre-wrap break-words">
          {JSON.stringify(post, null, 2)}
        </pre>
      ))}
    </div>
  );
}
