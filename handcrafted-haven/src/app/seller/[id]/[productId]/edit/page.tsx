import { notFound, redirect } from "next/navigation";
import { sql } from "@/app/lib/db";
import type { SellerProductRow } from "@/app/lib/seller";
import { updateProduct } from "@/app/lib/seller";

async function getProduct(productId: string): Promise<SellerProductRow | null> {
  const rows = await sql<SellerProductRow[]>`
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
      updated_at
    FROM products
    WHERE id = ${productId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string; productId: string }>;
}) {
  const { id, productId } = await params;

  const product = await getProduct(productId);
  if (!product || product.shop_id !== id) {
    notFound();
  }

  // make product non-null
  const safeProduct = product!;

  async function updateProductAction(formData: FormData) {
    "use server";

    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const stock = formData.get("stock");

    if (typeof title !== "string" || !title.trim()) {
      throw new Error("Title is required");
    }

    const priceCents =
      typeof price === "string" && price.trim()
        ? Math.round(parseFloat(price) * 100)
        : null;

    const stockNumber =
      typeof stock === "string" && stock.trim()
        ? parseInt(stock, 10)
        : 0;

    await updateProduct({
      id: safeProduct.id,
      shopId: id,
      title: title.trim(),
      description:
        typeof description === "string" ? description.trim() : null,
      priceCents,
      stock: stockNumber,
    });

    redirect(`/seller/${id}`);
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>

      <form action={updateProductAction} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="title"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            className="w-full rounded border p-2"
            defaultValue={safeProduct.title}
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="w-full rounded border p-2"
            defaultValue={safeProduct.description ?? ""}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="price"
            >
              Price (e.g. 12.50)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded border p-2"
              defaultValue={
                safeProduct.price_cents != null
                  ? (safeProduct.price_cents / 100).toFixed(2)
                  : ""
              }
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="stock"
            >
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              className="w-full rounded border p-2"
              defaultValue={safeProduct.stock}
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg border px-4 py-2 font-medium"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
