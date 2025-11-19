import { redirect } from "next/navigation";
import { createProduct } from "@/app/lib/seller";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  async function createProductAction(formData: FormData) {
    "use server";

    const shopId = formData.get("shopId");
    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const stock = formData.get("stock");

    if (typeof shopId !== "string" || !shopId) {
      throw new Error("shopId is required");
    }

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

    await createProduct({
      shopId,
      title: title.trim(),
      description:
        typeof description === "string" ? description.trim() : null,
      priceCents,
    });

    redirect(`/seller/${shopId}`);
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Add Product</h1>

      <form action={createProductAction} className="space-y-4">
        <input type="hidden" name="shopId" value={id} />

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
              defaultValue={1}
              className="w-full rounded border p-2"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-lg border px-4 py-2 font-medium"
        >
          Create Product
        </button>
      </form>
    </div>
  );
}
