import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@zoder.local";
  const adminPassword = "Zoder@2026Admin";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash },
  });

  const category = await prisma.category.upsert({
    where: { slug: "thoi-trang" },
    update: {},
    create: { name: "Thời trang", slug: "thoi-trang" },
  });

  const shopA = await prisma.shop.upsert({
    where: { slug: "shop-hoa-mai" },
    update: {},
    create: {
      name: "Shop Hoa Mai",
      slug: "shop-hoa-mai",
      description: "Chuyên áo quần thời trang nữ",
      categoryId: category.id,
    },
  });

  const shopB = await prisma.shop.upsert({
    where: { slug: "shop-nam-phong" },
    update: {},
    create: {
      name: "Shop Nam Phong",
      slug: "shop-nam-phong",
      description: "Thời trang nam công sở",
      categoryId: category.id,
    },
  });

  await prisma.product.upsert({
    where: { slug: "vay-hoa-mua-he" },
    update: {},
    create: {
      shopId: shopA.id,
      name: "Váy hoa mùa hè",
      slug: "vay-hoa-mua-he",
      description: "Váy hoa nhẹ nhàng, chất liệu thoáng mát",
      price: 259000,
      stock: 50,
    },
  });

  await prisma.product.upsert({
    where: { slug: "ao-so-mi-lua" },
    update: {},
    create: {
      shopId: shopA.id,
      name: "Áo sơ mi lụa",
      slug: "ao-so-mi-lua",
      description: "Áo sơ mi lụa cao cấp",
      price: 189000,
      stock: 30,
    },
  });

  await prisma.product.upsert({
    where: { slug: "ao-so-mi-cong-so-nam" },
    update: {},
    create: {
      shopId: shopB.id,
      name: "Áo sơ mi công sở nam",
      slug: "ao-so-mi-cong-so-nam",
      description: "Áo sơ mi trắng form slimfit",
      price: 219000,
      stock: 40,
    },
  });

  await prisma.product.upsert({
    where: { slug: "quan-tay-nam" },
    update: {},
    create: {
      shopId: shopB.id,
      name: "Quần tây nam",
      slug: "quan-tay-nam",
      description: "Quần tây công sở, vải co giãn",
      price: 299000,
      stock: 25,
    },
  });

  console.log("Seed done. Admin login:", adminEmail, "/", adminPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
