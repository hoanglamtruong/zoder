import Link from "next/link";
import PlaceholderThumb from "@/components/PlaceholderThumb";
import Badge from "@/components/Badge";
import { formatVND } from "@/lib/format";

const NEW_THRESHOLD_DAYS = 7;

function isNew(createdAt: string | Date) {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= NEW_THRESHOLD_DAYS;
}

export default function ProductCard({
  product,
  shopName,
}: {
  product: {
    slug: string;
    name: string;
    price: number;
    stock: number;
    createdAt: string | Date;
    variants?: { price: number; stock: number }[];
  };
  shopName?: string;
}) {
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const prices = hasVariants ? product.variants!.map((v) => v.price) : [product.price];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const stock = hasVariants
    ? product.variants!.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-xl border border-neutral-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-square">
        <PlaceholderThumb label={product.name} className="h-full w-full text-4xl" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew(product.createdAt) && <Badge variant="new">Mới</Badge>}
          {stock === 0 && <Badge variant="out">Hết hàng</Badge>}
          {stock > 0 && stock <= 5 && <Badge variant="low">Sắp hết</Badge>}
        </div>
      </div>
      <div className="p-3 space-y-1">
        {shopName && <p className="text-xs text-neutral-400 truncate">{shopName}</p>}
        <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-brand transition-colors">
          {product.name}
        </h3>
        <p className="text-brand font-bold">
          {minPrice === maxPrice ? formatVND(minPrice) : <>Từ {formatVND(minPrice)}</>}
        </p>
      </div>
    </Link>
  );
}
