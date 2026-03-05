import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@blueorange.digital" },
  });

  if (!existing) {
    const hash = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        email: "admin@blueorange.digital",
        name: "Admin",
        passwordHash: hash,
        role: "ADMIN",
      },
    });
    console.log("Created admin user: admin@blueorange.digital / admin123");
  } else {
    console.log("Admin user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
