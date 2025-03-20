import { User } from "@prisma/client";

export interface ProfileWithCounts extends User {
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}
