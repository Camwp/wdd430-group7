'use server';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sql } from '@/app/lib/db';

function bad(msg: string) {
    // If you prefer staying on page with an error, switch to useActionState pattern.
    const p = new URLSearchParams({ error: msg });
    redirect(`/seller/products/new?${p.toString()}`);
}

export async function createProduct(formData: FormData) {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id) bad('Please sign in.');
    if (user?.role !== 'seller' && user?.role !== 'admin') bad('Seller account required.');

    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const priceDollars = Number(String(formData.get('price') ?? '0'));
    const stock = Number(String(formData.get('stock') ?? '0'));
    const status = (String(formData.get('status') ?? 'active') || 'active') as 'active' | 'inactive' | 'archived' | 'sold_out';

    // Multi-select categories -> array of ids (or slugs handled below)
    const catValues = formData.getAll('categories'); // could be IDs or slugs
    // images: newline- or comma-separated; <input name="images">
    const imagesRaw = String(formData.get('images') ?? '');
    const imageUrls = imagesRaw
        .split(/\r?\n|,/)
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 10);

    if (!title) bad('Title is required.');
    if (!Number.isFinite(priceDollars) || priceDollars < 0) bad('Price must be a positive number.');
    if (!Number.isInteger(stock) || stock < 0) bad('Stock must be a non-negative integer.');

    // find the seller's shop_id
    // find the seller's shop_id
    const shopRow = await sql<{ id: string }[]>/*sql*/`
  SELECT id
  FROM shops
  WHERE seller_id = ${String(user!.id)}
  LIMIT 1
`;


    if (shopRow.length === 0) bad('No shop found for this seller.');
    const shopId = shopRow[0].id;

    const price_cents = Math.round(priceDollars * 100);

    // The work: insert product + images + categories transactionally
    const [{ product_id }] = await sql.begin(async (trx) => {
        // create product
        const [p] = await trx<{ id: string }[]>/*sql*/`
      INSERT INTO products (shop_id, title, description, price_cents, stock, status)
      VALUES (${shopId}, ${title}, ${description}, ${price_cents}, ${stock}, ${status})
      RETURNING id
    `;

        // categories: resolve each value as id or slug
        if (catValues.length) {
            // Normalize into a list of category IDs
            const cats = await trx<{ id: string }[]>/*sql*/`
        SELECT id FROM categories
        WHERE id = ANY(${catValues as any}) OR slug = ANY(${catValues as any})
      `;
            if (cats.length) {
                await Promise.all(
                    cats.map((c) => trx/*sql*/`
            INSERT INTO product_categories (product_id, category_id)
            VALUES (${p.id}, ${c.id})
            ON CONFLICT DO NOTHING
          `)
                );
            }
        }

        // images
        if (imageUrls.length) {
            await Promise.all(
                imageUrls.map((url, i) => trx/*sql*/`
          INSERT INTO product_images (product_id, url, sort_order)
          VALUES (${p.id}, ${url}, ${i})
        `)
            );
        }

        return [{ product_id: p.id }];
    });

    // You can redirect to the product details page or the seller profile
    redirect(`/product/${product_id}`);
}
