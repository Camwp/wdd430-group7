// src/components/landing/CategoryChips.tsx
const CATEGORIES = [
    "Pottery",
    "Jewelry",
    "Textiles",
    "Woodcraft",
    "Leather",
    "Glass",
    "Home Décor",
];

export default function CategoryChips() {
    return (
        <section aria-labelledby="browse-categories" className="mt-10">
            <div className="mb-3 flex items-end justify-between">
                <h2 id="browse-categories" className="text-xl font-semibold">Browse by category</h2>
                <a href="/catalog" className="text-sm text-emerald-700 hover:underline">View all</a>
            </div>
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                    <a
                        key={c}
                        href={`/catalog?category=${encodeURIComponent(c)}`}
                        className="inline-flex select-none items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {c}
                    </a>
                ))}
            </div>
        </section>
    );
}
