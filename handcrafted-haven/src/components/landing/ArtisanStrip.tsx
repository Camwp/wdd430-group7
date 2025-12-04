import { getTopArtisans } from '@/app/lib/landing';

export default async function ArtisanStrip() {
    const artisans = await getTopArtisans(4);

    return (
        <section aria-labelledby="meet-artisans" className="mt-12">
            <div className="mb-3 flex items-end justify-between">
                <h2 id="meet-artisans" className="text-xl font-semibold">Meet the artisans</h2>
                <a className="text-sm text-emerald-700 hover:underline" href="/sellers">View all sellers</a>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {artisans.map((a) => (
                    <a
                        key={a.shop_id}
                        href={`/seller/${a.slug}`} // use the shop id; swap to slug later if you add one
                        className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={a.avatar_url || '/avatar.png'}
                            alt=""
                            className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                            <div className="font-medium text-neutral-900">{a.display_name}</div>
                            <div className="text-sm text-neutral-600">{a.craft}</div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
