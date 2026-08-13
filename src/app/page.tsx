import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ShopCard from "@/components/ShopCard";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, shops, products] = await Promise.all([
    prisma.category.findMany({ include: { _count: { select: { shops: true } } } }),
    prisma.shop.findMany({
      include: { category: true, _count: { select: { products: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.product.findMany({
      include: { shop: true, variants: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div>
      <section className="bg-gradient-to-r from-brand to-brand-light text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Chợ đa gian hàng Zoder</h1>
          <p className="mt-2 text-white/90 max-w-xl">
            Hàng ngàn sản phẩm từ nhiều gian hàng uy tín — đặt hàng nhanh, giao COD tận nơi.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 space-y-12">
        {categories.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4">Danh mục</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand transition-colors"
                >
                  {c.name}
                  <span className="text-neutral-400 ml-1.5">({c._count.shops})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Gian hàng nổi bật</h2>
          </div>
          {shops.length === 0 ? (
            <p className="text-neutral-500">Chưa có gian hàng.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={{
                    slug: shop.slug,
                    name: shop.name,
                    description: shop.description,
                    categoryName: shop.category?.name,
                    productCount: shop._count.products,
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Sản phẩm mới nhất</h2>
          {products.length === 0 ? (
            <p className="text-neutral-500">Chưa có sản phẩm.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    slug: p.slug,
                    name: p.name,
                    price: Number(p.price),
                    stock: p.stock,
                    createdAt: p.createdAt,
                    variants: p.variants.map((v) => ({ price: Number(v.price), stock: v.stock })),
                  }}
                  shopName={p.shop.name}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
