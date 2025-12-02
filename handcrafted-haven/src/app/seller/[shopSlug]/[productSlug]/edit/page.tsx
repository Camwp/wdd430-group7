import { notFound, redirect } from "next/navigation";
import { sql } from "@/app/lib/db";

import { getShopBySlug, updateProduct } from "@/app/lib/seller";
import type { SellerProductRow } from "@/app/lib/seller";

// Fetch a product for editing by its slug
async function getProductForEdit(
  productSlug: string
): Promise<SellerProductRow | null> {
  const rows = await sql<SellerProductRow[]>/*sql*/`
    SELECT
      id,
      shop_id,
      title,
      description,
      price_cents,
      stock,
      status,
      rating_avg,
      rating_count,
      created_at,
      updated_at,
      slug
    FROM products
    WHERE slug = ${productSlug}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ shopSlug: string; productSlug: string }>;
}) {
  const { shopSlug, productSlug } = await params;

  // 1) Find the shop by slug
  const shop = await getShopBySlug(shopSlug);
  if (!shop) notFound();

  // 2) Find the product by slug
  const product = await getProductForEdit(productSlug);
  if (!product || product.shop_id !== shop.id) notFound();

  const safeProduct = product;
  const shopId = shop.id;
  const shopSlugForUrl = shop.slug;

  async function updateProductAction(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") as string;
    const stock = formData.get("stock") as string;

    if (!title.trim()) {
      throw new Error("Title is required");
    }

    const priceCents = price ? Math.round(parseFloat(price) * 100) : null;
    const stockNumber = stock ? parseInt(stock, 10) : 0;

    await updateProduct({
      id: safeProduct.id,
      shopId,
      title: title.trim(),
      description: description?.trim() ?? null,
      priceCents,
      stock: stockNumber,
    });

    redirect(`/seller/${shopSlugForUrl}`);
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Edit Product</h1>

      <form action={updateProductAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            defaultValue={safeProduct.title}
            className="border rounded w-full p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={safeProduct.description ?? ""}
            className="border rounded w-full p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={
                safeProduct.price_cents != null
                  ? (safeProduct.price_cents / 100).toFixed(2)
                  : ""
              }
              className="border rounded w-full p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Stock</label>
            <input
              name="stock"
              type="number"
              defaultValue={safeProduct.stock}
              className="border rounded w-full p-2"
            />
          </div>
        </div>

        <button type="submit" className="border rounded px-4 py-2 font-medium">
          Save Changes
        </button>
      </form>
    </div>
  );
}
