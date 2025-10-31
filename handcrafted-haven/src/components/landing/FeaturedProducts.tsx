// src/components/landing/FeaturedProducts.tsx
import ProductCard from "@/components/product/ProductCard";

const MOCK = [
    { id: "mug-1", title: "Hand-Thrown Stoneware Mug", priceCents: 3200, image: "/mug.jpg", rating: 4.8, reviews: 112 },
    { id: "ring-1", title: "Sterling Silver Stacking Ring", priceCents: 2400, image: "/ring.jpg", rating: 4.7, reviews: 89 },
    { id: "blanket-1", title: "Woven Wool Throw Blanket", priceCents: 9800, image: "/blanket.jpg", rating: 4.9, reviews: 54 },
];

export default function FeaturedProducts() {
    return (
        <section aria-labelledby="featured-products" className="mt-10">
            <div className="mb-3 flex items-end justify-between">
                <h2 id="featured-products" className="text-xl font-semibold">Featured products</h2>
                <a href="/catalog" className="text-sm text-emerald-700 hover:underline">Shop catalog</a>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK.map((p) => (
                    <ProductCard key={p.id} {...p} />
                ))}
            </div>
        </section>
    );
}
