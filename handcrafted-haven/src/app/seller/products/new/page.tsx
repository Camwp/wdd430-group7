import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sql } from '@/app/lib/db';
import { createProduct } from '@/app/lib/actions-products';

export const runtime = 'nodejs';

export default async function NewProductPage({
    searchParams,
}: {
    // Next.js 16: searchParams is a Promise — unwrap it
    searchParams: Promise<{ error?: string }>;
}) {
    const sp = await searchParams;
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;

    // Auth gate
    if (!user?.id) {
        return (
            <main className="container mx-auto max-w-2xl px-4 py-10">
                <h1 className="text-2xl font-semibold">Add a Product</h1>
                <p className="mt-4">Please <a className="text-emerald-700 underline" href="/auth/sign-in">sign in</a> as a seller.</p>
            </main>
        );
    }
    if (user.role !== 'seller' && user.role !== 'admin') {
        return (
            <main className="container mx-auto max-w-2xl px-4 py-10">
                <h1 className="text-2xl font-semibold">Add a Product</h1>
                <p className="mt-4 text-red-700">Seller account required.</p>
            </main>
        );
    }

    // Load categories for the multi-select
    const cats = await sql<{ id: string; name: string; slug: string }[]>/*sql*/`
    SELECT id, name, slug FROM categories ORDER BY name ASC
  `;

    return (
        <main className="container mx-auto max-w-2xl px-4 py-10">
            <h1 className="text-2xl font-semibold">Add a Product</h1>
            <p className="mt-1 text-sm text-neutral-600">
                Create a new listing for your shop.
            </p>

            {sp.error && (
                <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                    {sp.error}
                </div>
            )}

            <form action={createProduct} className="mt-6 space-y-5">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium">Title</label>
                    <input
                        id="title"
                        name="title"
                        required
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="e.g. Hand-carved Walnut Board"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={5}
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="Describe materials, size, finish, care, etc."
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium">Price (USD)</label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                            placeholder="89.00"
                        />
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium">Stock</label>
                        <input
                            id="stock"
                            name="stock"
                            type="number"
                            min="0"
                            required
                            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                            placeholder="5"
                        />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium">Status</label>
                        <select
                            id="status"
                            name="status"
                            defaultValue="active"
                            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="archived">Archived</option>
                            <option value="sold_out">Sold out</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Categories</label>
                    <p className="text-xs text-neutral-500">Hold Ctrl/Cmd to select multiple.</p>
                    <select
                        multiple
                        name="categories"
                        className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400 h-36"
                    >
                        {cats.map(c => (
                            // You can send either id or slug; action resolves both.
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="images" className="block text-sm font-medium">
                        Image URLs
                    </label>
                    <p className="text-xs text-neutral-500">One per line or comma-separated. First = primary.</p>
                    <textarea
                        id="images"
                        name="images"
                        rows={4}
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder={`https://.../photo1.jpg\nhttps://.../photo2.jpg`}
                    />
                </div>

                <button
                    className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    Create product
                </button>
            </form>
        </main>
    );
}
