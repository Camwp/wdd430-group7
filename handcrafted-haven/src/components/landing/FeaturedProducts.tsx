import { getFeaturedProducts } from '@/app/lib/landing';
import ProductCard from '@/components/product/ProductCard';

export default async function FeaturedProducts() {
    const rows = await getFeaturedProducts(3);

    // Adapter to your ProductCard props
    const items = rows.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        priceCents: p.price_cents,
        image: p.cover || '/placeholder-product.jpg',
        rating: typeof p.rating_avg === 'string' ? parseFloat(p.rating_avg) : (p.rating_avg ?? 0),
        reviews: p.rating_count ?? 0,
    }));

    return (
        <section aria-labelledby="featured-products" className="mt-10">
            <div className="mb-3 flex items-end justify-between">
                <h2 id="featured-products" className="text-xl font-semibold">Featured products</h2>
                <a href="/catalog" className="text-sm text-emerald-700 hover:underline">Shop catalog</a>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                    <ProductCard key={p.id} {...p} />
                ))}
            </div>
        </section>
    );
}
