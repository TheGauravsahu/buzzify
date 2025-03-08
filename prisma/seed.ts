import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Get an existing user (to link posts)
  const existingUser = await prisma.user.findFirst();

  if (!existingUser) {
    console.error("❌ No users found! Posts cannot be created.");
    return;
  }

  // Generate fake posts
  const postsData = Array.from({ length: 100 }).map((_, i) => ({
    title: `Post ${i + 1}`,
    description: `This is a post ${i + 1} with some description.`,
    image: `https://picsum.photos/id/${i + 10}/600/400`,
    authorId: existingUser.id,
  }));

  await prisma.post.createMany({
    data: postsData,
  });

  console.log("✅ Successfully seeded posts.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
