// src/components/landing/ArtisanStrip.tsx
const ARTISANS = [
    { name: "Jun Park", craft: "Ceramics", avatar: "/artisan-1.jpg" },
    { name: "Riley Hart", craft: "Jewelry", avatar: "/artisan-2.jpg" },
    { name: "Amara Diaz", craft: "Textiles", avatar: "/artisan-3.jpg" },
    { name: "Leo Nguyen", craft: "Woodcraft", avatar: "/artisan-4.jpg" },
];

export default function ArtisanStrip() {
    return (
        <section aria-labelledby="meet-artisans" className="mt-12">
            <div className="mb-3 flex items-end justify-between">
                <h2 id="meet-artisans" className="text-xl font-semibold">Meet the artisans</h2>
                <a className="text-sm text-emerald-700 hover:underline" href="/sellers">View all sellers</a>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {ARTISANS.map((a) => (
                    <a
                        key={a.name}
                        href={`/seller/${encodeURIComponent(a.name.toLowerCase().replace(/\s+/g, "-"))}`}
                        className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={a.avatar || "/avatar.png"}
                            alt=""
                            className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                            <div className="font-medium text-neutral-900">{a.name}</div>
                            <div className="text-sm text-neutral-600">{a.craft}</div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
