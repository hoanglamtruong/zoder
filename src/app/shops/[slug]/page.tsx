import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { category: true, products: { orderBy: { createdAt: "desc" } } },
  });

  if (!shop) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{shop.name}</h1>
        {shop.category && (
          <p className="text-sm text-neutral-500 mt-1">Danh mục: {shop.category.name}</p>
        )}
        {shop.description && <p className="mt-3 text-neutral-700">{shop.description}</p>}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Sản phẩm ({shop.products.length})</h2>
        {shop.products.length === 0 ? (
          <p className="text-neutral-500">Gian hàng chưa có sản phẩm.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shop.products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="rounded-xl border border-neutral-200 bg-white p-5 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-2 font-bold">{formatVND(Number(p.price))}</p>
                <p className="text-sm text-neutral-400 mt-1">
                  {p.stock > 0 ? `Còn ${p.stock} sản phẩm` : "Hết hàng"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
