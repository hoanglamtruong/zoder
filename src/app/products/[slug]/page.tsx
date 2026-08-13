import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/format";
import PlaceholderThumb from "@/components/PlaceholderThumb";
import Badge from "@/components/Badge";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { shop: true },
  });

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="text-sm text-neutral-500 mb-4">
        <Link href="/" className="hover:text-brand">
          Trang chủ
        </Link>
        {" / "}
        <Link href={`/shops/${product.shop.slug}`} className="hover:text-brand">
          {product.shop.name}
        </Link>
        {" / "}
        <span className="text-neutral-700">{product.name}</span>
      </nav>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <PlaceholderThumb label={product.name} className="aspect-square text-7xl" />

        <div className="p-8 space-y-4">
          <div className="flex items-center gap-2">
            {product.stock === 0 && <Badge variant="out">Hết hàng</Badge>}
            {product.stock > 0 && product.stock <= 5 && <Badge variant="low">Sắp hết hàng</Badge>}
          </div>

          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-3xl font-extrabold text-brand">{formatVND(Number(product.price))}</p>

          {product.description && <p className="text-neutral-600">{product.description}</p>}

          <p className="text-sm text-neutral-400">
            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Tạm hết hàng"}
          </p>

          <div className="pt-2">
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
      </div>
    </div>
  );
}
