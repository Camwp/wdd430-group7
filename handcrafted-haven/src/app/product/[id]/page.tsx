import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getProductFull, getProductReviews, userPurchasedProduct } from "@/app/lib/product";
import ProductGallery from "@/components/product/ProductGallery";
import { buyProduct, addReview, undoPurchase } from "@/app/lib/actions-store";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> };

export default async function ProductPage({ params, searchParams }: Params) {
    const { id } = await params;
    const sp = await searchParams;

    const product = await getProductFull(id);
    if (!product) {
        return (
            <main className="container mx-auto px-4 py-12">
                <h1 className="text-2xl font-semibold">Product not found</h1>
            </main>
        );
    }

    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;

    const canBuy = product.status === "active" && product.stock > 0 && !!user?.id;
    const purchased = user?.id ? await userPurchasedProduct(String(user.id), product.id) : false;
    const canReview = !!user?.id && purchased;

    const reviews = await getProductReviews(product.id);

    return (
        <main className="container mx-auto px-4 py-8">
            {sp.msg && (
                <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
                    {sp.msg}
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <ProductGallery images={product.images} />

                <section>
                    <h1 className="text-2xl font-semibold">{product.title}</h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        by <span className="font-medium">{product.shop_name}</span>
                    </p>

                    <div className="mt-3 text-neutral-800">
                        {product.description || <span className="text-neutral-500">No description.</span>}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <div className="text-2xl font-semibold">
                            {(product.price_cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })}
                        </div>
                        <div className="text-sm text-neutral-600">
                            ★ {Number(product.rating_avg || 0).toFixed(1)} ({product.rating_count})
                        </div>
                    </div>

                    <div className="mt-2 text-sm">
                        {product.stock > 0 ? (
                            <span className="text-emerald-700">In stock ({product.stock})</span>
                        ) : (
                            <span className="text-red-700">Sold out</span>
                        )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        {product.stock > 0 ? (
                            user?.id ? (
                                <form action={async () => { "use server"; await buyProduct(product.id); }}>
                                    <button
                                        className="rounded-md bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                                        disabled={!canBuy}
                                    >
                                        Buy
                                    </button>
                                </form>
                            ) : (
                                <a
                                    className="rounded-md bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-700"
                                    href="/auth/sign-in"
                                >
                                    Sign in to buy
                                </a>
                            )
                        ) : (
                            <button className="rounded-md bg-neutral-300 px-5 py-2 text-neutral-700" disabled>
                                Sold out
                            </button>
                        )}

                        {/* Dev/testing helper: only show if this user has purchased */}
                        {purchased && (
                            <form action={async () => { "use server"; await undoPurchase(product.id); }}>
                                <button
                                    type="submit"
                                    className="rounded-md border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
                                    title="Remove your purchase and restore stock (testing only)"
                                >
                                    Undo purchase (dev)
                                </button>
                            </form>
                        )}
                    </div>


                    {product.categories.length > 0 && (
                        <div className="mt-6 text-sm text-neutral-600">
                            Categories:{" "}
                            {product.categories.map((c, i) => (
                                <a key={c.id} className="underline underline-offset-2 hover:text-emerald-700" href={`/catalog?category=${c.slug}`}>
                                    {c.name}{i < product.categories.length - 1 ? ", " : ""}
                                </a>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Reviews */}
            <section className="mt-12">
                <h2 className="text-xl font-semibold">Reviews</h2>

                {canReview ? (
                    <form action={addReview} className="mt-4 space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
                        <input type="hidden" name="productId" value={product.id} />
                        <div>
                            <label className="block text-sm font-medium" htmlFor="rating">Rating</label>
                            <select
                                id="rating"
                                name="rating"
                                className="mt-1 w-24 rounded-md border border-neutral-300 bg-white px-2 py-2"
                                defaultValue="5"
                            >
                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium" htmlFor="title">Title (optional)</label>
                            <input
                                id="title"
                                name="title"
                                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                                placeholder="Great quality!"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium" htmlFor="body">Review</label>
                            <textarea
                                id="body"
                                name="body"
                                rows={4}
                                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
                                placeholder="Share details about build quality, materials, shipping, etc."
                                required
                            />
                        </div>
                        <button className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-800">
                            Submit review
                        </button>
                    </form>
                ) : (
                    <p className="mt-2 text-sm text-neutral-600">
                        {reviews.length === 0
                            ? "No reviews yet."
                            : "Only customers who purchased this item can leave a review."}
                    </p>
                )}

                <div className="mt-6 space-y-4">
                    {reviews.map(r => (
                        <article key={r.id} className="rounded-lg border border-neutral-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">{r.author_name || "Anonymous"}</div>
                                <div className="text-sm text-neutral-600">★ {r.rating} · {new Date(r.created_at).toLocaleDateString()}</div>
                            </div>
                            {r.title && <div className="mt-1 font-semibold">{r.title}</div>}
                            {r.body && <p className="mt-1 text-neutral-800 whitespace-pre-line">{r.body}</p>}
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}
