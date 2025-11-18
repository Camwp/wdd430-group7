import { unstable_noStore as noStore } from "next/cache";
import { sql } from "@/app/lib/db";

export type ShopRow = {
  id: string;
  seller_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
};

export type SellerProductRow = {
  id: string;
  shop_id: string;
  title: string;
  description: string | null;
  price_cents: number | null;
  stock: number;
  status: string;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
};

export type SellerProfile = {
  shop: ShopRow;
  products: SellerProductRow[];
  images: ProductImageRow[];
};

export async function getSellerProfile(shopId: string): Promise<SellerProfile | null> {
  noStore();

  if (!shopId) {
    throw new Error("getSellerProfile: shopId is required");
  }

  // 1) Shop row
  const shops = await sql<ShopRow[]>`
    SELECT id, seller_id, display_name, bio, avatar_url, banner_url, created_at
    FROM shops
    WHERE id = ${shopId}
    LIMIT 1
  `;

  if (!shops.length) return null;
  const shop = shops[0];

  // 2) products for that shop
  const products = await sql<SellerProductRow[]>`
    SELECT
      id,
      shop_id,
      title,
      description,
      price_cents,
      stock,
      status,
      COALESCE(rating_avg, 0)::numeric AS rating_avg,
      COALESCE(rating_count, 0)       AS rating_count,
      created_at,
      updated_at
    FROM products
    WHERE shop_id = ${shopId}
    ORDER BY created_at DESC
  `;

  // 3) all images for those products
  let images: ProductImageRow[] = [];
  const productIds = products.map((p) => p.id);

  if (productIds.length > 0) {
    images = await sql<ProductImageRow[]>`
      SELECT id, product_id, url, sort_order
      FROM product_images
      WHERE product_id = ANY(${productIds})
      ORDER BY sort_order ASC
    `;
  }

  return { shop, products, images };
}

export async function deleteProduct(productId: string) {
  if (!productId) throw new Error("deleteProduct: productId is required");

  await sql`
    DELETE FROM products
    WHERE id = ${productId}
  `;
}

export async function createProduct(input: {
  shopId: string;
  title: string;
  description?: string | null;
  priceCents?: number | null;
}) {

  // insert a new row into products and return the created product
  const [row] = await sql`
    INSERT INTO products (
      shop_id,
      title,
      description,
      price_cents,
      stock,
      status,
      rating_avg,
      rating_count
    )
    VALUES (
      ${input.shopId},
      ${input.title},
      ${input.description ?? null},
      ${input.priceCents ?? null},
      1,           -- default stock for new listing
      'active',    -- default status
      0.0,         -- rating_avg (no reviews yet)
      0           -- rating_count
    )
    RETURNING
      id,
      shop_id,
      title,
      description,
      price_cents,
      stock,
      status,
      rating_avg,
      rating_count,
      created_at,
      updated_at
  `;

  return row;
}

export async function updateProduct(input: {
  id: string;
  shopId: string;
  title: string;
  description?: string | null;
  priceCents?: number | null;
  stock: number;
}) {
  if (!input.id) throw new Error("updateProduct: id is required");

  const [row] = await sql<SellerProductRow[]>`
    UPDATE products
    SET
      title       = ${input.title},
      description = ${input.description ?? null},
      price_cents = ${input.priceCents ?? null},
      stock       = ${input.stock},
      updated_at  = NOW()
    WHERE id = ${input.id} AND shop_id = ${input.shopId}
    RETURNING
      id,
      shop_id,
      title,
      description,
      price_cents,
      stock,
      status,
      rating_avg,
      rating_count,
      created_at,
      updated_at
  `;

  return row ?? null;
}