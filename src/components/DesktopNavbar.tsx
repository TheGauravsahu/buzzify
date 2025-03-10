import React from "react";
import { ModeToggle } from "./ModeToggle";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "./ui/button";
import { BellIcon, HomeIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { getUserByClerkId } from "@/actions/user.action";

export default async function DesktopNavbar() {
  const session = await currentUser();
  const user = await getUserByClerkId(session?.id!);

  return (
    <div className="hidden md:flex items-center space-x-4">
      <ModeToggle />

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link prefetch={true} href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {session ? (
        <>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link prefetch={true} href="/notifications">
              <BellIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Notifications</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link prefetch={true} href={`/profile/${user?.username}`}>
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default" className="cursor-pointer">
            Sign In
          </Button>
        </SignInButton>
      )}
    </div>
  );
}
