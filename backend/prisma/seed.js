import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

try {
  await prisma.review.deleteMany();
  await prisma.gym.deleteMany();

  await prisma.gym.createMany({
    data: [
      {
        name: "Iron House Gym",
        location: "Stockholm",
      },
      {
        name: "Nordic Fitness",
        location: "Göteborg",
      },
    ],
  });
} finally {
  await prisma.$disconnect();
}
