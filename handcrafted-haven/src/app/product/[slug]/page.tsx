import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import {
  getProductFullBySlug,
  getProductReviews,
  userPurchasedProduct
} from "@/app/lib/product";

import ProductGallery from "@/components/product/ProductGallery";
import { buyProduct, addReview, undoPurchase } from "@/app/lib/actions-store";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ msg?: string }>;
};

export default async function ProductPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const sp = await searchParams;

  const product = await getProductFullBySlug(slug);

  if (!product) {
    return (
      <main className="container mx-auto py-12">
        <h1 className="text-2xl font-semibold">Product not found</h1>
      </main>
    );
  }

  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;

  const canBuy =
    product.status === "active" && product.stock > 0 && !!user?.id;
  const purchased = user?.id
    ? await userPurchasedProduct(String(user.id), product.id)
    : false;
  const canReview = !!user?.id && purchased;

  const reviews = await getProductReviews(product.id);

  const ratingValue =
    typeof product.rating_avg === "string"
      ? parseFloat(product.rating_avg)
      : product.rating_avg ?? 0;

  const ratingCount = product.rating_count ?? 0;

  return (
    <main className="container mx-auto px-4 py-8">
      {sp.msg && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          {sp.msg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} />

        <section>
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            by <span className="font-medium">{product.shop_name}</span>
          </p>

          <div className="mt-3 text-neutral-800">
            {product.description || (
              <span className="text-neutral-500">No description.</span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="text-2xl font-semibold">
              {(product.price_cents / 100).toLocaleString(undefined, {
                style: "currency",
                currency: "USD",
              })}
            </div>
            <div className="text-sm text-neutral-600">
              ★ {ratingValue.toFixed(1)} ({ratingCount})
            </div>
          </div>

          <div className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-emerald-700">
                In stock ({product.stock})
              </span>
            ) : (
              <span className="text-red-700">Sold out</span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {product.stock > 0 ? (
              user?.id ? (
                <form
                  action={async () => {
                    "use server";
                    await buyProduct(product.id);
                  }}
                >
                  <button
                    className="bg-emerald-600 text-white px-5 py-2 rounded-md"
                    disabled={!canBuy}
                  >
                    Buy
                  </button>
                </form>
              ) : (
                <a
                  href="/auth/sign-in"
                  className="bg-emerald-600 text-white px-5 py-2 rounded-md"
                >
                  Sign in to buy
                </a>
              )
            ) : (
              <button
                disabled
                className="bg-neutral-300 px-5 py-2 text-neutral-700 rounded-md"
              >
                Sold out
              </button>
            )}

            {purchased && (
              <form
                action={async () => {
                  "use server";
                  await undoPurchase(product.id);
                }}
              >
                <button className="border border-red-300 text-red-700 px-4 py-2 rounded-md">
                  Undo purchase (dev)
                </button>
              </form>
            )}
          </div>

          {product.categories.length > 0 && (
            <div className="mt-6 text-sm text-neutral-600">
              Categories:{" "}
              {product.categories.map((c, i) => (
                <a
                  key={c.id}
                  className="underline underline-offset-2 hover:text-emerald-700"
                  href={`/catalog?category=${c.slug}`}
                >
                  {c.name}
                  {i < product.categories.length - 1 ? ", " : ""}
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
          <form action={addReview} className="mt-4 space-y-3 border p-4 rounded-lg">
            <input type="hidden" name="productId" value={product.id} />

            <div>
              <label className="block text-sm font-medium">Rating</label>
              <select
                id="rating"
                name="rating"
                className="border rounded w-24 px-2 py-1 bg-white"
                defaultValue="5"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                name="title"
                className="border rounded w-full p-2"
                placeholder="Great quality!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Review</label>
              <textarea
                name="body"
                rows={4}
                className="border rounded w-full p-2"
                placeholder="Share your experience"
                required
              />
            </div>

            <button className="bg-neutral-900 text-white px-4 py-2 rounded-md">
              Submit review
            </button>
          </form>
        ) : (
          <p className="mt-2 text-sm text-neutral-600">
            {reviews.length === 0
              ? "No reviews yet."
              : "Only customers who bought this item can leave a review."}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <article key={r.id} className="border rounded p-4">
              <div className="flex justify-between mb-1">
                <div className="font-medium">{r.author_name || "Anonymous"}</div>
                <div className="text-sm text-neutral-600">
                  ★ {r.rating} · {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
              {r.title && <div className="font-semibold">{r.title}</div>}
              <p className="mt-1 whitespace-pre-line">{r.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

