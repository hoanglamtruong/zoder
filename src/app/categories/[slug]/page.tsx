import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ShopCard from "@/components/ShopCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      shops: {
        include: { _count: { select: { products: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Danh mục: {category.name}</h1>

      {category.shops.length === 0 ? (
        <p className="text-neutral-500">Chưa có gian hàng nào trong danh mục này.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.shops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={{
                slug: shop.slug,
                name: shop.name,
                description: shop.description,
                productCount: shop._count.products,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
