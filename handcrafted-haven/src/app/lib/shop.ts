import { unstable_noStore as noStore } from "next/cache";
import { sql } from "@/app/lib/db";

export type SellersParams = {
    q?: string;
    sort?: "new" | "name" | "popular";
    page?: number;
    pageSize?: number;
};

type SellerRow = {
    id: string;
    display_name: string;
    bio: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    created_at: string;
    product_count: number;
    slug: string;
};

function orderSql(sort?: SellersParams["sort"]) {
    switch (sort) {
        case "name": return sql`LOWER(s.display_name) ASC`;
        case "popular": return sql`product_count DESC, LOWER(s.display_name) ASC`;
        case "new":
        default: return sql`s.created_at DESC, s.id DESC`;
    }
}

// Helper: AND together a list of sql fragments without sql.join
function andWhere(fragments: any[]) {
    if (fragments.length === 0) return sql``;
    return fragments.slice(1).reduce((acc, frag) => sql`${acc} AND ${frag}`, fragments[0]);
}

export async function listSellers(params: SellersParams) {
    noStore();
    const { q = "", sort = "new", page = 1, pageSize = 12 } = params;

    const like = `%${q}%`;
    const offset = (page - 1) * pageSize;

    // Build WHERE pieces
    const whereParts = [sql`1=1`];
    if (q) whereParts.push(sql`(s.display_name ILIKE ${like} OR s.bio ILIKE ${like})`);
    const whereSql = andWhere(whereParts);

    const orderBy = orderSql(sort);

    // Count
    const [{ count }] = await sql<{ count: number }[]>/*sql*/`
    SELECT COUNT(*)::int AS count
    FROM shops s
    WHERE ${whereSql}
  `;

    // Rows
    const rows = await sql<SellerRow[]>/*sql*/`
      SELECT
        s.id,
        s.display_name,
        s.bio,
        s.avatar_url,
        s.banner_url,
        s.created_at,
        COALESCE((
          SELECT COUNT(*) FROM products p
          WHERE p.shop_id = s.id AND p.status = 'active'
        ), 0)::int AS product_count,
        s.slug
      FROM shops s
      WHERE ${whereSql}
      ORDER BY ${orderBy}
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    return {
        total: count,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(count / pageSize)),
        rows,
    };
}
