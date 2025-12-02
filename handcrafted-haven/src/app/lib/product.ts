import { unstable_noStore as noStore } from "next/cache";
import { sql } from "@/app/lib/db";

export type ProductFull = {
    id: string;
    title: string;
    description: string | null;
    price_cents: number;
    stock: number;
    status: string;
    rating_avg: number;
    rating_count: number;
    shop_id: string;
    shop_name: string;
    images: { url: string }[];
    categories: { id: string; name: string; slug: string }[];
};

export async function getProductFull(id: string) {
    noStore();

    const rows = await sql<ProductFull[]>/*sql*/`
    WITH base AS (
      SELECT p.id, p.title, p.description, p.price_cents, p.stock, p.status,
             COALESCE(p.rating_avg, 0)::numeric AS rating_avg,
             COALESCE(p.rating_count, 0) AS rating_count,
             s.id AS shop_id, s.display_name AS shop_name
      FROM products p
      JOIN shops s ON s.id = p.shop_id
      WHERE p.id = ${id}
      LIMIT 1
    )
    SELECT
      b.id, b.title, b.description, b.price_cents, b.stock, b.status,
      b.rating_avg, b.rating_count, b.shop_id, b.shop_name,
      ARRAY(SELECT json_build_object('url', pi.url)
            FROM product_images pi WHERE pi.product_id = b.id ORDER BY sort_order ASC) AS images,
      ARRAY(SELECT json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
            FROM product_categories pc JOIN categories c ON c.id = pc.category_id
            WHERE pc.product_id = b.id ORDER BY c.name ASC) AS categories
    FROM base b
  `;

    if (!rows.length) return null;

    const r: any = rows[0];
    return {
        ...r,
        images: (r.images ?? []).map((x: any) => ({ url: String(x.url) })),
        categories: (r.categories ?? []).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
    } as ProductFull;
}

export type ReviewRow = {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    created_at: string;
    author_name: string | null;
};

export async function getProductReviews(productId: string) {
    noStore();
    const rows = await sql<ReviewRow[]>/*sql*/`
    SELECT r.id, r.rating, r.title, r.body, r.created_at,
           u.name AS author_name
    FROM reviews r
    LEFT JOIN users u ON u.id = r.author_id
    WHERE r.product_id = ${productId}
    ORDER BY r.created_at DESC
    LIMIT 100
  `;
    return rows;
}

export async function userPurchasedProduct(userId: string, productId: string) {
    const [{ exists }] = await sql<{ exists: boolean }[]>/*sql*/`
    SELECT EXISTS (
      SELECT 1 FROM purchases WHERE user_id = ${userId} AND product_id = ${productId}
    ) AS exists
  `;
    return !!exists;
}

export async function getProductBySlug(slug: string) {
  noStore();

  const [product] = await sql/*sql*/`
    SELECT *
    FROM products
    WHERE slug = ${slug}
    LIMIT 1
  `;

  return product ?? null;
}

export async function getProductFullBySlug(slug: string) {
  const basic = await getProductBySlug(slug);
  if (!basic) return null;

  return getProductFull(basic.id);
}