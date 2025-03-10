"use client";

import { editProfile, getProfileByUsername } from "@/actions/profile.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useMutation,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingButton from "@/components/LoadingButton";
import { useRouter } from "next/navigation";

interface EditProfileDialogProps {
  username: string;
}

export default function EditProfileDialog({
  username,
}: EditProfileDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [currentUsername, setCurrentUsername] = useState(username);
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    bio: "",
    website: "",
    location: "",
  });

  const { data: user } = useSuspenseQuery({
    queryKey: ["profile", currentUsername],
    queryFn: () => getProfileByUsername(currentUsername),
  });

  // sync data
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        website: user.website || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: editProfile,
    onSuccess: (updatedUser) => {
      // If the username changed, update params
      if (updatedUser.username !== currentUsername) {
        setCurrentUsername(updatedUser.username);
        router.push(`/profile/${updatedUser.username}`);
      }

      queryClient.invalidateQueries({ queryKey: ["profile", currentUsername] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={userData.name}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={userData?.username}
              onChange={(e) =>
                setUserData({ ...userData, username: e.target.value })
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="Bio" className="text-right">
              Bio
            </Label>
            <Textarea
              id="Bio"
              onChange={(e) =>
                setUserData({ ...userData, bio: e.target.value })
              }
              value={userData.bio}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="website" className="text-right">
              Website
            </Label>
            <Input
              id="website"
              onChange={(e) =>
                setUserData({ ...userData, website: e.target.value })
              }
              value={userData.website}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="locaton" className="text-right">
              Locaton
            </Label>
            <Input
              id="locaton"
              value={userData.location}
              onChange={(e) =>
                setUserData({ ...userData, location: e.target.value })
              }
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <LoadingButton
            isPending={mutation.isPending}
            onClick={async () => {
              if (!userData) toast.error("All fields are required.");
              await mutation.mutate(userData);
            }}
          >
            Save changes
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
