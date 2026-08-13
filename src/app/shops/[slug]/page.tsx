import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PlaceholderThumb from "@/components/PlaceholderThumb";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      category: true,
      products: { orderBy: { createdAt: "desc" }, include: { variants: true } },
    },
  });

  if (!shop) notFound();

  return (
    <div>
      <div className="bg-gradient-to-r from-brand to-brand-dark text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 flex items-center gap-5">
          <PlaceholderThumb
            label={shop.name}
            className="h-20 w-20 rounded-full ring-4 ring-white/40 text-2xl shrink-0"
          />
          <div>
            <h1 className="text-2xl font-bold">{shop.name}</h1>
            {shop.category && (
              <p className="text-sm text-white/80 mt-1">Danh mục: {shop.category.name}</p>
            )}
            {shop.description && <p className="mt-2 text-white/90 max-w-xl">{shop.description}</p>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-lg font-bold mb-4">Sản phẩm ({shop.products.length})</h2>
        {shop.products.length === 0 ? (
          <p className="text-neutral-500">Gian hàng chưa có sản phẩm.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {shop.products.map((p) => (
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
