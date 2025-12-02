import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  getSellerProfile,
  deleteProduct,
  getShopBySlug
} from "@/app/lib/seller";

import { getCurrentUser } from "@/app/lib/auth";
import DeleteProductButton from "./DeleteProductButton";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ msg?: string }>;
};

export async function deleteProductAction(formData: FormData) {
  "use server";

  const shopId = formData.get("shopId");
  const productId = formData.get("productId");

  if (typeof shopId !== "string" || typeof productId !== "string") return;

  const currentUser = await getCurrentUser();
  if (!currentUser?.id) redirect("/auth/sign-in");

  const data = await getSellerProfile(shopId);
  if (!data || data.shop.seller_id !== currentUser.id) {
    redirect(`/seller/${data?.shop.slug ?? ""}?msg=Not+authorized`);
  }

  await deleteProduct(productId);

  revalidatePath(`/seller/${data.shop.slug}`);
  redirect(`/seller/${data.shop.slug}?msg=Listing+deleted`);
}

export default async function SellerPage({ params, searchParams }: Params) {
  const [{ shopSlug }, sp, currentUser] = await Promise.all([
    params,
    searchParams,
    getCurrentUser()
  ]);

  const shopFromSlug = await getShopBySlug(shopSlug);
  if (!shopFromSlug) {
    return (
      <main className="container mx-auto py-12">
        <h1 className="text-2xl font-semibold">Seller not found</h1>
      </main>
    );
  }

  const data = await getSellerProfile(shopFromSlug.id);
  if (!data) {
    return (
      <main className="container mx-auto py-12">
        <h1 className="text-2xl font-semibold">Seller not found</h1>
      </main>
    );
  }

  const { shop, products, images } = data;
  const isOwner = currentUser?.id === shop.seller_id;

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      {sp.msg && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          {sp.msg}
        </div>
      )}

      {/* banner */}
      {shop.banner_url && (
        <div className="w-full aspect-[1472/192] rounded-xl overflow-hidden">
          <img
            src={shop.banner_url}
            alt="Shop banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* seller header */}
      <section className="flex flex-col sm:flex-row gap-6 items-start">
        {shop.avatar_url && (
          <img
            src={shop.avatar_url}
            alt={shop.display_name}
            className="w-24 h-24 rounded-full border object-cover"
          />
        )}

        <div>
          <h1 className="text-3xl font-semibold">{shop.display_name}</h1>
          {shop.bio && <p className="mt-2">{shop.bio}</p>}
        </div>
      </section>

      {/* product list */}
      <section>
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Handcrafted Collection</h2>

          {isOwner && (
            <Link
              href={`/seller/${shop.slug}/newproduct`}
              className="border rounded px-3 py-1.5 text-sm hover:bg-neutral-100"
            >
              + Add product
            </Link>
          )}
        </div>

        {products.length === 0 && (
          <p className="text-neutral-600">
            {isOwner
              ? "You haven’t listed anything yet."
              : "This shop has no items yet."}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => {
            const imgs = images.filter((i) => i.product_id === product.id);
            const primary = imgs[0];

            return (
              <article
                key={product.id}
                className="border rounded-lg p-4 flex flex-col"
              >
              {primary && (
                <Link href={`/product/${product.slug}`}>
                  <img
                    src={primary.url}
                    alt={product.title}
                    className="h-40 object-cover rounded mb-3 cursor-pointer hover:opacity-90 transition"
                  />
                </Link>
              )}


                <h3 className="font-semibold">{product.title}</h3>

                {product.price_cents != null && (
                  <p className="text-sm mt-1">
                    {(product.price_cents / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD"
                    })}
                  </p>
                )}

                {product.description && (
                  <p className="mt-2 text-sm line-clamp-4">
                    {product.description}
                  </p>
                )}

                {isOwner && (
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/seller/${shop.slug}/${product.slug}/edit`}
                      className="border border-emerald-500 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded text-xs hover:bg-emerald-100"
                    >
                      Edit
                    </Link>

                    <DeleteProductButton
                      shopId={shop.id}
                      productId={product.id}
                      action={deleteProductAction}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
