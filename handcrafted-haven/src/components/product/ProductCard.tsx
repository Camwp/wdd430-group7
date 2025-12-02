// src/components/product/ProductCard.tsx
import Link from "next/link";

type Props = {
    id: string;
    slug?: string;
    title: string;
    priceCents: number;
    image?: string;
    rating?: number;
    reviews?: number;
};

export default function ProductCard({
    id,
    slug,
    title,
    priceCents,
    image,
    rating,
    reviews
}: Props) {
    const price = (priceCents / 100).toFixed(2);

    return (
        <Link
            href={`/product/${slug ?? id}`}
            className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
            <div className="aspect-[4/5] bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt={title}
                    src={image || "/placeholder.png"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
            </div>

            <div className="p-3">
                <h3 className="line-clamp-1 font-medium text-neutral-900">{title}</h3>

                <div className="mt-1 text-sm text-neutral-600">
                    {typeof rating === "number"
                        ? `★ ${rating.toFixed(1)} (${reviews ?? 0})`
                        : "No ratings yet"}
                </div>

                <div className="mt-1 font-semibold text-neutral-900">${price}</div>
            </div>
        </Link>
    );
}
