import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/lib/auth";
import { getSellerProfile, createProduct } from "@/app/lib/seller";

export const runtime = "nodejs";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: shopId } = await params;

  async function createProductAction(formData: FormData) {
    "use server";

    const rawShopId = formData.get("shopId");
    if (typeof rawShopId !== "string" || !rawShopId) {
      throw new Error("Missing shopId in form");
    }
    const shopId = rawShopId;

    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const imageUrl = formData.get("imageUrl");
    const category = formData.get("category"); // ✅ NEW

    if (typeof title !== "string" || !title.trim()) {
      redirect(`/seller/${shopId}/newproduct?msg=Title+is+required`);
    }

    if (typeof category !== "string" || !category.trim()) {
      redirect(`/seller/${shopId}/newproduct?msg=Category+is+required`);
    }

    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      redirect(`/seller/${shopId}?msg=Not+authorized`);
    }

    const data = await getSellerProfile(shopId);
    if (!data || data.shop.seller_id !== currentUser.id) {
      redirect(`/seller/${shopId}?msg=Not+authorized`);
    }

    let priceCents: number | null = null;
    if (typeof price === "string" && price.trim() !== "") {
      const numeric = Number(price);
      if (!Number.isNaN(numeric) && numeric >= 0) {
        priceCents = Math.round(numeric * 100);
      }
    }

    await createProduct({
      shopId,
      title: title.trim(),
      description:
        typeof description === "string" && description.trim() !== ""
          ? description.trim()
          : null,
      priceCents,
      imageUrl:
        typeof imageUrl === "string" && imageUrl.trim() !== ""
          ? imageUrl.trim()
          : null,
      categoryName: category, // ✅ Pass to createProduct
    });

    revalidatePath(`/seller/${shopId}`);
    redirect(`/seller/${shopId}?msg=Listing+created`);
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Add a new product</h1>

      <form
        action={createProductAction}
        className="space-y-4 rounded-lg border bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="shopId" value={shopId} />

        <div className="space-y-1">
          <label
            htmlFor="title"
            className="text-sm font-medium text-neutral-700"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="description"
            className="text-sm font-medium text-neutral-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={4}
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="price"
            className="text-sm font-medium text-neutral-700"
          >
            Price (USD)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        {/* ✅ Category dropdown */}
        <div className="space-y-1">
          <label
            htmlFor="category"
            className="text-sm font-medium text-neutral-700"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            className="w-full rounded-md border px-3 py-2 text-sm bg-white"
            required
          >
            <option value="">Select a category</option>
            <option value="Home Decor">Home Decor</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Ceramics">Ceramics</option>
            <option value="Woodwork">Woodwork</option>
            <option value="Metalwork">Metalwork</option>
            <option value="Art">Art</option>
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="imageUrl"
            className="text-sm font-medium text-neutral-700"
          >
            Image URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://example.com/my-product.jpg"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center rounded-md border border-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-900 hover:text-white"
        >
          Create product
        </button>
      </form>
    </main>
  );
}
