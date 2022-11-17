import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });


  const posts = [
    {
      slug: "my-first",
      title: "My first note",
      markdown: `Hello, world!
      
      isn't it great? `.trim(),
    },
    {
      slug: "trail riding with onewheel-blog-9443",
      title: "Trail riding with onewheel-blog-9443",
      markdown: `# Floating the trails
      
      Have you ever tried riding onesheel?`.trim(),
    },
  ]

  for (const post of posts){
    await prisma.post.upsert({
      where: {slug: post.slug},
      update: post,
      create: post,
    })
  }
// after adding seed changes, run `npx prisma db seed`
  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
