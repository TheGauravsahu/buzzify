import PostsList from "@/components/PostsList";
import { buttonVariants } from "@/components/ui/button";
import WhoToFollow from "@/components/WhoToFollow";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-full">
      <h1 className="text-2xl font-bold ">Latest Posts</h1>

      <div className="my-4">
        <Link
          className={buttonVariants({ variant: "secondary" })}
          href="/dashboard/create"
        >
          Creat Post
        </Link>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <PostsList />
        </div>

        <div className="hidden md:block md:w-[25%]">
          <WhoToFollow />
        </div>
      </div>
    </div>
  );
}
