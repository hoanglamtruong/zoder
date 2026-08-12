import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { shop: true },
  });

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href={`/shops/${product.shop.slug}`} className="text-sm text-neutral-500 hover:underline">
        ← {product.shop.name}
      </Link>
      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-8 space-y-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-2xl font-bold text-neutral-900">{formatVND(Number(product.price))}</p>
        {product.description && <p className="text-neutral-700">{product.description}</p>}
        <p className="text-sm text-neutral-400">
          {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
        </p>
        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: Number(product.price),
            imageUrl: product.imageUrl,
            shopId: product.shopId,
            shopName: product.shop.name,
            stock: product.stock,
          }}
        />
      </div>
    </div>
  );
}
