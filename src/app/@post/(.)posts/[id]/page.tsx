import PostDetails from "@/app/posts/[id]/PostDetails";
import CloseButton from "@/components/general/navigation/CloseButton";
import React from "react";

export default async function PostModel({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-black/80 fixed inset-0" />

      <div className="absolute top-3 right-3 z-[99] cursor-pointer">
        <CloseButton />
      </div>

      <div className="bg-background rounded-lg overflow-hidden shadow-lg z-10 md:max-w-4xl w-[90%] h-[90vh]">
        <PostDetails postId={id} />
      </div>
    </div>
  );
}
