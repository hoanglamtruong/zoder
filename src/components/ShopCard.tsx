import Link from "next/link";
import PlaceholderThumb from "@/components/PlaceholderThumb";

export default function ShopCard({
  shop,
}: {
  shop: {
    slug: string;
    name: string;
    description: string | null;
    categoryName?: string | null;
    productCount: number;
  };
}) {
  return (
    <Link
      href={`/shops/${shop.slug}`}
      className="group rounded-xl border border-neutral-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="h-20 bg-gradient-to-r from-brand to-brand-light" />
      <div className="px-5 pb-5 -mt-8">
        <PlaceholderThumb
          label={shop.name}
          className="h-16 w-16 rounded-full ring-4 ring-white text-xl"
        />
        <h3 className="mt-3 font-semibold text-lg group-hover:text-brand transition-colors">
          {shop.name}
        </h3>
        {shop.description && (
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{shop.description}</p>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
          {shop.categoryName && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5">{shop.categoryName}</span>
          )}
          <span>{shop.productCount} sản phẩm</span>
        </div>
      </div>
    </Link>
  );
}
