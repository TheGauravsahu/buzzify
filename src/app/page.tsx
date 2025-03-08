import PostsList from "@/components/PostsList";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
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
      <PostsList />
    </div>
  );
}
