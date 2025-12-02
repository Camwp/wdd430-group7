"use client";

import { useRef, useState } from "react";

type Props = {
  shopId: string;
  productId: string;
  action: (formData: FormData) => void; // server action from parent
};

export default function DeleteProductButton({ shopId, productId, action }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  function handleOpen() {
    setOpen(true);
  }

  function handleCancel() {
    if (!submitting) setOpen(false);
  }

  function handleConfirm() {
    if (!formRef.current) return;
    setSubmitting(true);
    // submit the hidden form; server action handles redirect
    formRef.current.requestSubmit();
  }

  return (
    <>
      {/* trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center justify-center rounded-md border border-red-400 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
        disabled={submitting}
      >
        Delete
      </button>

      {/* hidden form wired to the server action */}
      <form ref={formRef} action={action} className="hidden">
        <input type="hidden" name="shopId" value={shopId} />
        <input type="hidden" name="productId" value={productId} />
      </form>

      {/* centered modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              Delete this product?
            </h2>
            <p className="text-sm text-neutral-600 mb-4">
              This will permanently remove the listing from your shop. This action
              can&apos;t be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center rounded-md border border-red-500 bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-70"
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
