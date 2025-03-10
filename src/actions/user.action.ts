"use server";
import db from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return existingUser;

    const dbUser = await db.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function getUserByClerkId(clerkId: string) {
  return db.user.findFirst({
    where: {
      clerkId,
    },
  });
}

export async function getUserIdByUsername(username: string) {
  const user = await db.user.findUnique({
    where: {
      username,
    },
  });

  return user?.id;
}
export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getRandomUsers() {
  const userId = await getDbUserId();
  if (!userId) return [];

  // get 3 random users except ourselves & users that we already follow
  const randomUsers = await db.user.findMany({
    where: {
      AND: [
        { NOT: { id: userId } },
        {
          NOT: {
            // TODO: remove users that we already follow
            // UPDATE: Not doing right now because there's mot much users.
          },
        },
      ],
    },
    include: {
      _count: {
        select: {
          followers: true,
        },
      },
      followers: true,
    },
    take: 3,
  });

  return randomUsers;
}

export async function toggleFollow(targetUserId: string) {
  const userId = await getDbUserId();
  if (!userId) throw new Error("Login to follow.");

  if (userId === targetUserId) throw new Error("You cannot follow yourself");

  const existingFollow = await db.follows.findFirst({
    where: {
      followerId: userId,
      followingId: targetUserId,
    },
  });

  if (existingFollow) {
    // unfollow
    await db.follows.delete({
      where: {
        id: existingFollow.id,
      },
    });
    return { isFollowing: false };
  } else {
    // follow
    await db.follows.create({
      data: {
        followerId: userId,
        followingId: targetUserId,
      },
    });

    return { isFollowing: true };
  }
}



export async function checkIfFollowing(targetUserId: string) {
  const userId = await getDbUserId();
  if (!userId) return false;

  const existingFollow = await db.follows.findFirst({
    where: {
      followerId: userId,
      followingId: targetUserId,
    },
  });

  return Boolean(existingFollow);
}
