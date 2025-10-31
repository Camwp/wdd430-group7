// src/components/landing/Hero.tsx
export default function Hero() {
    return (
        <section
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-emerald-100 px-6 py-16 sm:px-10"
            aria-labelledby="hero-title"
        >
            <div className="mx-auto max-w-5xl">
                <h1 id="hero-title" className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                    Discover artisan-made treasures
                </h1>
                <p className="mt-3 max-w-2xl text-neutral-700">
                    Support local creators. Shop sustainably. Find something truly unique.
                </p>

                <form action="/catalog" className="mt-8 flex max-w-2xl gap-2" role="search" aria-label="Product search">
                    <label className="sr-only" htmlFor="site-search">Search products</label>
                    <input
                        id="site-search"
                        name="q"
                        placeholder="Search pottery, jewelry, textiles..."
                        className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <button
                        className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        Search
                    </button>
                </form>

                <div className="mt-6 text-sm text-neutral-600">
                    Popular: <span className="underline-offset-2 hover:underline">stoneware mugs</span>,{" "}
                    <span className="underline-offset-2 hover:underline">silver rings</span>,{" "}
                    <span className="underline-offset-2 hover:underline">woven blankets</span>
                </div>
            </div>

            {/* Decorative blobs */}
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-200/60 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-amber-200/60 blur-3xl" />
        </section>
    );
}
