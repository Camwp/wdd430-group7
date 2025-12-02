import { unstable_noStore as noStore } from "next/cache";
import { sql } from "./db";

export type CatalogParams = {
  q?: string;
  category?: string;     // category slug
  min?: number;          // dollars
  max?: number;          // dollars
  sort?: "new" | "price-asc" | "price-desc" | "rating";
  page?: number;
  pageSize?: number;
};

function buildOrder(sort?: CatalogParams["sort"]) {
  switch (sort) {
    case "price-asc": return sql`p.price_cents ASC, p.created_at DESC`;
    case "price-desc": return sql`p.price_cents DESC, p.created_at DESC`;
    case "rating": return sql`p.rating_avg DESC, p.rating_count DESC, p.created_at DESC`;
    case "new":
    default: return sql`p.created_at DESC, p.id DESC`;
  }
}

// AND all sql fragments into one fragment
function andAll(parts: any[]) {
  if (!parts.length) return sql`TRUE`;
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    out = sql`${out} AND ${parts[i]}`;
  }
  return out;
}

export async function listCatalog(params: CatalogParams) {
  noStore();
  const {
    q = "",
    category,
    min,
    max,
    sort = "new",
    page = 1,
    pageSize = 12,
  } = params;

  const like = `%${q}%`;
  const offset = (page - 1) * pageSize;

  // base WHERE
  const where = [sql`p.status = 'active'`];
  if (q) where.push(sql`(p.title ILIKE ${like} OR p.description ILIKE ${like})`);
  if (min != null) where.push(sql`p.price_cents >= ${Math.round(min * 100)}`);
  if (max != null) where.push(sql`p.price_cents <= ${Math.round(max * 100)}`);

  const whereSql = andAll(where);
  const orderBy = buildOrder(sort);

  if (category) {
    const [{ count }] = await sql/*sql*/`
      SELECT COUNT(*)::int AS count
      FROM products p
      JOIN product_categories pc ON pc.product_id = p.id
      JOIN categories c ON c.id = pc.category_id
      WHERE ${whereSql} AND c.slug = ${category}
    `;

    const rows = await sql/*sql*/`
      SELECT
        p.id,
        p.title,
        p.price_cents,
        p.rating_avg,
        p.rating_count,
        p.slug,
        COALESCE((
          SELECT url FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY sort_order ASC
          LIMIT 1
        ), '') AS cover
      FROM products p
      JOIN product_categories pc ON pc.product_id = p.id
      JOIN categories c ON c.id = pc.category_id
      WHERE ${whereSql} AND c.slug = ${category}
      ORDER BY ${orderBy}
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    return {
      total: count,
      page, pageSize,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
      rows,
    };
  }

  const [{ count }] = await sql/*sql*/`
    SELECT COUNT(*)::int AS count
    FROM products p
    WHERE ${whereSql}
  `;

  const rows = await sql/*sql*/`
    SELECT
      p.id,
      p.title,
      p.price_cents,
      p.rating_avg,
      p.rating_count,
      p.slug,
      COALESCE((
        SELECT url FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY sort_order ASC
        LIMIT 1
      ), '') AS cover
    FROM products p
    WHERE ${whereSql}
    ORDER BY ${orderBy}
    LIMIT ${pageSize} OFFSET ${offset}
  `;


  return {
    total: count,
    page, pageSize,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
    rows,
  };
}
