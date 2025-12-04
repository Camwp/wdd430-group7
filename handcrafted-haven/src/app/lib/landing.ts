// src/app/lib/landing.ts
import { unstable_noStore as noStore } from 'next/cache';
import { sql } from '@/app/lib/db';

// ----- Types for query rows -----
type ArtisanRow = {
  shop_id: string;
  slug: string;
  display_name: string;
  avatar_url: string | null;
  craft: string | null;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
};

type FeaturedRow = {
  id: string;
  slug: string;
  title: string;
  price_cents: number;
  rating_avg: string | number | null; // numeric comes back as string
  rating_count: number | null;
  cover: string | null;
};

// Top shops with a best-guess "craft" from their dominant category
export async function getTopArtisans(limit = 4) {
  noStore();

  const rows = await sql<ArtisanRow[]>/*sql*/`
    WITH shop_stats AS (
      SELECT s.id AS shop_id,
            s.slug,  
             s.display_name,
             s.avatar_url,
             COUNT(p.id) AS product_count
      FROM shops s
      LEFT JOIN products p ON p.shop_id = s.id AND p.status = 'active'
      GROUP BY s.id
    ),
    craft_guess AS (
      SELECT p.shop_id,
             c.name AS craft,
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
             st.slug,  
           st.display_name,
           COALESCE(st.avatar_url, '') AS avatar_url,
           COALESCE(cg.craft, 'Maker') AS craft
    FROM shop_stats st
    LEFT JOIN craft_guess cg
      ON cg.shop_id = st.shop_id AND cg.rn = 1
    ORDER BY st.product_count DESC, st.shop_id
    LIMIT ${limit};
  `;

return rows.map(r => ({
  shop_id: r.shop_id,
  slug: r.slug,
  display_name: r.display_name,
  avatar_url: r.avatar_url ?? '',
  craft: r.craft ?? 'Maker',
}));
}

export async function getTopCategories(limit = 12) {
  noStore();

  const rows = await sql<CategoryRow[]>/*sql*/`
    SELECT id, slug, name
    FROM categories
    ORDER BY name ASC
    LIMIT ${limit}
  `;

  return rows;
}

export async function getFeaturedProducts(limit = 6) {
  noStore();

  const rows = await sql<FeaturedRow[]>/*sql*/`
    SELECT p.id,
           p.title,
           p.slug,
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

  return rows.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price_cents: p.price_cents,
    rating_avg: typeof p.rating_avg === 'string' ? parseFloat(p.rating_avg) : (p.rating_avg ?? 0),
    rating_count: p.rating_count ?? 0,
    cover: p.cover ?? '',
  }));
}
