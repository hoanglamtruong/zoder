import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const products = query
    ? await prisma.product.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        include: { shop: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-xl font-semibold mb-6">
        {query ? (
          <>
            Kết quả cho <span className="text-brand">&quot;{query}&quot;</span> ({products.length})
          </>
        ) : (
          "Nhập từ khóa để tìm sản phẩm"
        )}
      </h1>

      {query && products.length === 0 && (
        <p className="text-neutral-500">Không tìm thấy sản phẩm phù hợp.</p>
      )}

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
            }}
            shopName={p.shop.name}
          />
        ))}
      </div>
    </div>
  );
}
