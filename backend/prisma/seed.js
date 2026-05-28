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
  const gymCount = await prisma.gym.count();

  if (gymCount === 0) {
    await prisma.gym.createMany({
      data: [
        {
          name: "Iron House Gym",
          location: "Stockholm",
        },
        {
          name: "Nordic Fitness",
          location: "Goteborg",
        },
      ],
    });
  }
} finally {
  await prisma.$disconnect();
}
