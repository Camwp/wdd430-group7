import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  getShopBySlug,
  getSellerProfile,
  createProduct
} from "@/app/lib/seller";

import { getCurrentUser } from "@/app/lib/auth";

export const runtime = "nodejs";

export default async function NewProductPage({
  params
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;

  const shop = await getShopBySlug(shopSlug);
  if (!shop) redirect("/?msg=Shop+not+found");

  const shopId = shop.id;

  async function createProductAction(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") as string;
    const imageUrl = formData.get("imageUrl") as string | null;
    const category = formData.get("category") as string;

    if (!title.trim()) {
      redirect(`/seller/${shop.slug}/newproduct?msg=Title+is+required`);
    }
    if (!category.trim()) {
      redirect(`/seller/${shop.slug}/newproduct?msg=Category+is+required`);
    }

    const currentUser = await getCurrentUser();
    if (!currentUser?.id) redirect("/auth/sign-in");

    const profile = await getSellerProfile(shopId);
    if (!profile || profile.shop.seller_id !== currentUser.id) {
      redirect(`/seller/${shop.slug}?msg=Not+authorized`);
    }

    const priceCents = price ? Math.round(parseFloat(price) * 100) : null;

    await createProduct({
      shopId,
      title: title.trim(),
      description: description?.trim() || null,
      priceCents,
      imageUrl: imageUrl?.trim() || null,
      categoryName: category
    });

    revalidatePath(`/seller/${shop.slug}`);
    redirect(`/seller/${shop.slug}?msg=Listing+created`);
  }

  return (
    <main className="container mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Add a new product</h1>

      <form
        action={createProductAction}
        className="space-y-4 border rounded p-6 bg-white shadow-sm"
      >
        <div>
          <label className="block mb-1 font-medium text-sm">Title</label>
          <input name="title" className="border rounded w-full p-2" />
        </div>

        <div>
          <label className="block mb-1 font-medium text-sm">Description</label>
          <textarea
            name="description"
            className="border rounded w-full p-2"
            rows={4}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-sm">Price</label>
          <input
            name="price"
            type="number"
            step="0.01"
            className="border rounded w-full p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-sm">Category</label>
          <select
            name="category"
            className="border rounded w-full p-2 bg-white"
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

        <div>
          <label className="block mb-1 font-medium text-sm">Image URL</label>
          <input name="imageUrl" className="border rounded w-full p-2" />
        </div>

        <button className="border rounded px-4 py-2 font-medium">
          Create product
        </button>
      </form>
    </main>
  );
}
