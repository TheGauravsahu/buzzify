import { getPosts } from "@/actions/post.action";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const posts = await getPosts();
  return (
    <div>
      <h1 className="text-2xl font-bold ">Latest Posts</h1>

      <div className="my-4">
        <Link
          className={buttonVariants({ variant: "secondary" })}
          href="/dashboard/create"
        >
          Creat Post
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(post, null, 2)}
          </pre>
        ))}
      </div>
    </div>
  );
}
