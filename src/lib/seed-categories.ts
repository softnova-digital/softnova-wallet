import { db } from "./db";

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

export async function seedCategories() {
  for (const category of defaultCategories) {
    await db.category.upsert({
      where: { id: category.name.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-") },
      update: {},
      create: {
        id: category.name.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-"),
        name: category.name,
        type: "EXPENSE", // All seeded categories are expense categories
        icon: category.icon,
        color: category.color,
        isDefault: true,
      },
    });
  }
}

