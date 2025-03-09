"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function CloseButton() {
  const router = useRouter();
  return (
    <>
      <button
      className=""
        onClick={() => {
          router.back()
        }}
      >
        <X color="white" className="cursor-pointer" />
      </button>
    </>
  );
}