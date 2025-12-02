import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "Office Supplies", icon: "package", color: "#2ECC71" },
  { name: "Travel", icon: "plane", color: "#3498DB" },
  { name: "Software/Subscriptions", icon: "monitor", color: "#9B59B6" },
  { name: "Marketing", icon: "megaphone", color: "#E74C3C" },
  { name: "Utilities", icon: "zap", color: "#F39C12" },
  { name: "Meals", icon: "utensils", color: "#1ABC9C" },
  { name: "Equipment", icon: "laptop", color: "#34495E" },
  { name: "Other", icon: "folder", color: "#95A5A6" },
];

async function main() {
  console.log("Seeding database...");

  for (const category of defaultCategories) {
    const id = category.name.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-");
    await prisma.category.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        isDefault: true,
      },
    });
    console.log(`Created category: ${category.name}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

