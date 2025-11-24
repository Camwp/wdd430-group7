import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSellerProfile, deleteProduct } from "@/app/lib/seller";
import { getCurrentUser } from "@/app/lib/auth";
import DeleteProductButton from "./DeleteProductButton";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
};

// delete a product
async function deleteProductAction(formData: FormData) {
  "use server";

  const shopId = formData.get("shopId");
  const productId = formData.get("productId");

  if (typeof shopId !== "string" || typeof productId !== "string") {
    return;
  }

  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    redirect(`/seller/${shopId}?msg=Not+authorized`);
  }

  const data = await getSellerProfile(shopId);
  if (!data || data.shop.seller_id !== currentUser.id) {
    redirect(`/seller/${shopId}?msg=Not+authorized`);
  }

  await deleteProduct(productId);

  revalidatePath(`/seller/${shopId}`);
  redirect(`/seller/${shopId}?msg=Listing+deleted`);
}

export default async function SellerPage({ params, searchParams }: Params) {
  const [{ id }, sp, currentUser] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);

  const data = await getSellerProfile(id);

  if (!data) {
    return (
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold">Seller not found</h1>
        <p className="mt-2 text-sm text-neutral-600">No shop with id {id}</p>
      </main>
    );
  }

  const { shop, products, images } = data;
  const isOwner = !!currentUser?.id && currentUser.id === shop.seller_id;

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
            alt={`${shop.display_name} banner`}
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* seller header */}
      <section className="flex flex-col sm:flex-row gap-6 items-start">
        {shop.avatar_url && (
          <img
            src={shop.avatar_url}
            alt={shop.display_name}
            className="w-24 h-24 rounded-full object-cover border"
          />
        )}
        <div>
          <h1 className="text-3xl font-semibold">{shop.display_name}</h1>
          {shop.bio && (
            <p className="mt-2 text-neutral-700 whitespace-pre-line">
              {shop.bio}
            </p>
          )}
        </div>
      </section>

      {/* products collection */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Handcrafted Collection</h2>

          {isOwner && (
            <Link
              href={`/seller/${id}/newproduct`}
              className="inline-flex items-center rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
            >
              + Add product
            </Link>
          )}
        </div>

        {products.length === 0 && (
          <p className="text-neutral-600">
            {isOwner
              ? "You haven’t listed any items yet. Use “Add product” to create your first listing."
              : "This artisan hasn’t listed any items yet."}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => {
            const productImages = images.filter(
              (img) => img.product_id === product.id
            );
            const primaryImage = productImages[0];

            return (
              <article
                key={product.id}
                className="border rounded-lg p-4 flex flex-col"
              >
                {primaryImage && (
                  <img
                    src={primaryImage.url}
                    alt={product.title}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}

                <h3 className="font-semibold">{product.title}</h3>

                {product.price_cents != null && (
                  <p className="text-sm mt-1">
                    {(product.price_cents / 100).toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                )}

                {product.description && (
                  <p className="mt-2 text-sm text-neutral-700 line-clamp-4">
                    {product.description}
                  </p>
                )}

                {isOwner && (
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/seller/${id}/${product.id}/edit`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>

                    <DeleteProductButton
                      productId={product.id}
                      shopId={id}
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
