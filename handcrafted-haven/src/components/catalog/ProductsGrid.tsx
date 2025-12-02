import { listCatalog, type CatalogParams } from "@/app/lib/catalog";
import ProductCard from "@/components/product/ProductCard";

export default async function ProductsGrid(params: CatalogParams) {
    const data = await listCatalog(params);

    if (!data.rows.length) {
        return <p className="mt-6 text-neutral-600">No products match your filters.</p>;
    }

    const items = data.rows.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    priceCents: p.price_cents,
    image: p.cover || "/placeholder-product.jpg",
    rating: typeof p.rating_avg === "string" ? parseFloat(p.rating_avg) : (p.rating_avg ?? 0),
    reviews: p.rating_count ?? 0,
    }));

    return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it: {
        id: string;
        slug: string;
        title: string;
        priceCents: number;
        image: string;
        rating: number;
        reviews: number;
        }) => (
        <ProductCard key={it.id} {...it} />
        ))}
    </div>
    );

}
