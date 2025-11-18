"use client";

type Props = {
  productId: string;
  shopId: string;
  action: (formData: FormData) => Promise<void>;
};

export default function DeleteProductButton({ productId, shopId, action }: Props) {
  async function handleSubmit(formData: FormData) {
    const ok = window.confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    await action(formData);
  }

  return (
    <form action={handleSubmit} className="inline-block">
      <input type="hidden" name="shopId" value={shopId} />
      <input type="hidden" name="productId" value={productId} />

      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:underline"
      >
        Delete
      </button>
    </form>
  );
}
