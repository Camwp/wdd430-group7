'use server';

import { revalidatePath } from 'next/cache';
import { sql } from './db';

export async function createProduct(formData: FormData, sellerUserId: string) {
  // look up seller's shop
  const [shop] = await sql/*sql*/`SELECT id FROM shops WHERE seller_id = ${sellerUserId}`;
  if (!shop) return { error: 'Shop not found for seller.' };

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const priceStr = String(formData.get('price') ?? '0');
  const stockStr = String(formData.get('stock') ?? '0');
  const categoryIds = (formData.getAll('category_ids') as string[]) ?? [];
  const imageUrls = (formData.getAll('image_urls') as string[]) ?? [];

  const price_cents = Math.round(Number(priceStr) * 100);
  const stock = Math.max(0, Number(stockStr) || 0);

  if (!title || price_cents < 0) return { error: 'Invalid product fields.' };

  const [{ id: productId }] = await sql/*sql*/`
    INSERT INTO products (shop_id, title, description, price_cents, stock, status)
    VALUES (${shop.id}, ${title}, ${description}, ${price_cents}, ${stock}, 'active')
    RETURNING id
  `;

  // categories
  if (categoryIds.length) {
    await Promise.all(
      categoryIds.map((cid, i) => sql/*sql*/`
        INSERT INTO product_categories (product_id, category_id)
        VALUES (${productId}, ${cid})
        ON CONFLICT DO NOTHING
      `)
    );
  }

  // images
  if (imageUrls.length) {
    await Promise.all(
      imageUrls.map((url, i) => sql/*sql*/`
        INSERT INTO product_images (product_id, url, sort_order)
        VALUES (${productId}, ${url}, ${i})
      `)
    );
  }

  revalidatePath('/'); // or revalidate your shop/products listing pages
  return { productId };
}

export async function addReview(productId: string, authorUserId: string, formData: FormData) {
  const rating = Math.max(1, Math.min(5, Number(formData.get('rating') ?? 0)));
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  if (!rating) return { error: 'Rating required.' };

  await sql.begin(async () => {
    await sql/*sql*/`
      INSERT INTO reviews (product_id, author_id, rating, title, body)
      VALUES (${productId}, ${authorUserId}, ${rating}, ${title}, ${body})
    `;

    // update aggregates
    const [agg] = await sql/*sql*/`
      SELECT ROUND(AVG(rating)::numeric, 2) AS avg, COUNT(*)::int AS cnt
      FROM reviews WHERE product_id = ${productId}
    `;
    await sql/*sql*/`
      UPDATE products
      SET rating_avg = ${agg.avg ?? 0}, rating_count = ${agg.cnt ?? 0}, updated_at = now()
      WHERE id = ${productId}
    `;
  });

  revalidatePath(`/product/${productId}`);
  return { ok: true };
}