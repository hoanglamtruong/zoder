import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, shops] = await Promise.all([
    prisma.category.findMany({ include: { _count: { select: { shops: true } } } }),
    prisma.shop.findMany({
      include: { products: { take: 1 }, _count: { select: { products: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-12">
      <section>
        <h1 className="text-2xl font-bold mb-4">Danh mục nổi bật</h1>
        {categories.length === 0 ? (
          <p className="text-neutral-500">Chưa có danh mục.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <span
                key={c.id}
                className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm"
              >
                {c.name} ({c._count.shops})
              </span>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Gian hàng nổi bật</h2>
        {shops.length === 0 ? (
          <p className="text-neutral-500">Chưa có gian hàng.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.slug}`}
                className="rounded-xl border border-neutral-200 bg-white p-5 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg">{shop.name}</h3>
                {shop.description && (
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{shop.description}</p>
                )}
                <p className="text-sm text-neutral-400 mt-3">{shop._count.products} sản phẩm</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
