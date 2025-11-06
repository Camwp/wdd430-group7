import { unstable_noStore as noStore } from 'next/cache';
import { sql } from './db';

export async function listProducts(params: {
    query?: string;
    categorySlug?: string;
    page?: number;
    pageSize?: number;
}) {
    noStore();
    const { query = '', categorySlug, page = 1, pageSize = 12 } = params;
    const q = `%${query}%`;
    const offset = (page - 1) * pageSize;

    if (categorySlug) {
        const [{ count }] = await sql/*sql*/`
      SELECT COUNT(*)::int AS count
      FROM products p
      JOIN product_categories pc ON pc.product_id = p.id
      JOIN categories c ON c.id = pc.category_id
      WHERE p.status = 'active'
        AND (p.title ILIKE ${q} OR p.description ILIKE ${q})
        AND c.slug = ${categorySlug}
    `;

        const rows = await sql/*sql*/`
      SELECT p.id, p.title, p.price_cents, p.rating_avg, p.rating_count,
             COALESCE((
               SELECT url FROM product_images pi
               WHERE pi.product_id = p.id
               ORDER BY sort_order ASC LIMIT 1
             ), '') AS cover
      FROM products p
      JOIN product_categories pc ON pc.product_id = p.id
      JOIN categories c ON c.id = pc.category_id
      WHERE p.status = 'active'
        AND (p.title ILIKE ${q} OR p.description ILIKE ${q})
        AND c.slug = ${categorySlug}
      ORDER BY p.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

        return { total: count, page, pageSize, totalPages: Math.max(1, Math.ceil(count / pageSize)), rows };
    }

    const [{ count }] = await sql/*sql*/`
    SELECT COUNT(*)::int AS count
    FROM products p
    WHERE p.status = 'active'
      AND (p.title ILIKE ${q} OR p.description ILIKE ${q})
  `;

    const rows = await sql/*sql*/`
    SELECT p.id, p.title, p.price_cents, p.rating_avg, p.rating_count,
           COALESCE((
             SELECT url FROM product_images pi
             WHERE pi.product_id = p.id
             ORDER BY sort_order ASC LIMIT 1
           ), '') AS cover
    FROM products p
    WHERE p.status = 'active'
      AND (p.title ILIKE ${q} OR p.description ILIKE ${q})
    ORDER BY p.created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;

    return { total: count, page, pageSize, totalPages: Math.max(1, Math.ceil(count / pageSize)), rows };
}

export async function getProductDetail(id: string) {
    noStore();
    const [p] = await sql/*sql*/`
    SELECT p.*, s.display_name AS shop_name
    FROM products p
    JOIN shops s ON s.id = p.shop_id
    WHERE p.id = ${id}
  `;
    if (!p) return null;

    const images = await sql/*sql*/`
    SELECT id, url, sort_order
    FROM product_images
    WHERE product_id = ${id}
    ORDER BY sort_order ASC
  `;

    const cats = await sql/*sql*/`
    SELECT c.slug, c.name
    FROM product_categories pc
    JOIN categories c ON c.id = pc.category_id
    WHERE pc.product_id = ${id}
    ORDER BY c.name ASC
  `;

    const revs = await sql/*sql*/`
    SELECT r.id, r.rating, r.title, r.body, r.created_at,
           u.name AS author_name
    FROM reviews r
    JOIN users u ON u.id = r.author_id
    WHERE r.product_id = ${id}
    ORDER BY r.created_at DESC
    LIMIT 20
  `;

    return { ...p, images, categories: cats, reviews: revs };
}
