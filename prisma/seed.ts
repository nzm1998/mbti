import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const topics = [
  { slug: "xiaoque", title: "今天的小确幸", description: "今天让你感到幸福的一件小事", sortOrder: 1 },
  { slug: "sentence", title: "今天最喜欢的一句话", description: "今天读到/听到的触动你的一句话", sortOrder: 2 },
  { slug: "emo", title: "今天的小emo", description: "今天的一点小情绪，说出来会好受些", sortOrder: 3 },
  { slug: "question", title: "今天的一个小问题", description: "今天困扰你的一个问题，看看同类的答案", sortOrder: 4 },
];

async function main() {
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: topic,
      create: topic,
    });
  }
  console.log("✅ 话题数据已插入");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
