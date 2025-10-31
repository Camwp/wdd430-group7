// src/lib/landing.ts
import { unstable_noStore as noStore } from 'next/cache';
import { sql } from '@/app/lib/db';

// Top shops with “craft” inferred from their most common product category.
// Falls back to 'Maker' when no category found.
export async function getTopArtisans(limit = 4) {
    noStore();
    // pick shops that actually have products, newest first
    const rows = await sql/*sql*/`
    WITH shop_stats AS (
      SELECT s.id AS shop_id,
             s.display_name,
             s.avatar_url,
             COUNT(p.id) AS product_count
      FROM shops s
      LEFT JOIN products p ON p.shop_id = s.id AND p.status = 'active'
      GROUP BY s.id
    ),
    craft_guess AS (
      SELECT p.shop_id,
             c.name AS craft_name,
             ROW_NUMBER() OVER (
               PARTITION BY p.shop_id
               ORDER BY COUNT(*) DESC, MIN(p.created_at) DESC
             ) AS rn
      FROM products p
      JOIN product_categories pc ON pc.product_id = p.id
      JOIN categories c ON c.id = pc.category_id
      WHERE p.status = 'active'
      GROUP BY p.shop_id, c.name
    )
    SELECT st.shop_id,
           st.display_name,
           COALESCE(st.avatar_url, '') AS avatar_url,
           COALESCE(cg.craft_name, 'Maker') AS craft
    FROM shop_stats st
    LEFT JOIN craft_guess cg
      ON cg.shop_id = st.shop_id AND cg.rn = 1
    ORDER BY st.product_count DESC, st.shop_id
    LIMIT ${limit};
  `;
    return rows as Array<{ shop_id: string; display_name: string; avatar_url: string; craft: string }>;
}

export async function getTopCategories(limit = 12) {
    noStore();
    const rows = await sql/*sql*/`
    SELECT id, slug, name
    FROM categories
    ORDER BY name ASC
    LIMIT ${limit}
  `;
    return rows as Array<{ id: string; slug: string; name: string }>;
}

// Featured products = newest active products with cover image + rating
export async function getFeaturedProducts(limit = 6) {
    noStore();
    const rows = await sql/*sql*/`
    SELECT p.id,
           p.title,
           p.price_cents,
           p.rating_avg,
           p.rating_count,
           COALESCE((
             SELECT url
             FROM product_images pi
             WHERE pi.product_id = p.id
             ORDER BY sort_order ASC
             LIMIT 1
           ), '') AS cover
    FROM products p
    WHERE p.status = 'active'
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ${limit}
  `;
    return rows as Array<{
        id: string;
        title: string;
        price_cents: number;
        rating_avg: number | string;   // postgres numeric can come as string
        rating_count: number;
        cover: string;
    }>;
}
