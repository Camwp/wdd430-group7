'use server';

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sql } from "@/app/lib/db";

// ✅ tell TS this never returns (redirect throws)
function backTo(slug: string, msg?: string): never {
  const p = new URLSearchParams();
  if (msg) p.set("msg", msg);
  const qs = p.toString();
  redirect(`/product/${slug}${qs ? `?${qs}` : ""}`);
}

export async function buyProduct(productId: string, slug: string) {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;

    if (!user?.id) backTo(slug, "Please sign in.");

    // ✅ after the guard, narrow to concrete values
    const userId = String(user.id);
    const role = user.role ?? "buyer";

    if (role !== "buyer" && role !== "admin" && role !== "seller") {
        backTo(slug, "Account not allowed to purchase.");
    }

    await sql/*sql*/`
    CREATE TABLE IF NOT EXISTS purchases (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (user_id, product_id)
    );
  `;

    await sql.begin(async (trx) => {
        const [{ ok }] = await trx<{ ok: boolean }[]>/*sql*/`
      WITH upd AS (
        UPDATE products
        SET stock = stock - 1, updated_at = now()
        WHERE id = ${productId} AND stock > 0 AND status = 'active'
        RETURNING 1
      )
      SELECT EXISTS(SELECT 1 FROM upd) AS ok
    `;
        if (!ok) backTo(slug, "Sold out or unavailable.");

        await trx/*sql*/`
      INSERT INTO purchases (user_id, product_id)
      VALUES (${userId}, ${productId})
      ON CONFLICT DO NOTHING
    `;
    });

    backTo(slug, "Thanks for your purchase!");
}

export async function addReview(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  const productSlug = String(formData.get("productSlug") || "");
  const rating = Number(formData.get("rating") || 0);
  const title = String(formData.get("title") || "");
  const body = String(formData.get("body") || "");

  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) backTo(productSlug, "Please sign in to review.");

  const userId = String(user.id);

  const [{ exists }] = await sql<{ exists: boolean }[]>/*sql*/`
    SELECT EXISTS(
      SELECT 1 FROM purchases WHERE user_id = ${userId} AND product_id = ${productId}
    ) AS exists
  `;
  if (!exists) backTo(productSlug, "You can only review items you've purchased.");
  if (!(rating >= 1 && rating <= 5)) backTo(productSlug, "Rating must be 1–5.");

  await sql.begin(async (trx) => {
    await trx/*sql*/`
      INSERT INTO reviews (product_id, author_id, rating, title, body)
      VALUES (${productId}, ${userId}, ${rating}, ${title || null}, ${body || null})
    `;
    await trx/*sql*/`
      UPDATE products p
      SET rating_avg = sub.avg_rating,
          rating_count = sub.cnt
      FROM (
        SELECT product_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS cnt
        FROM reviews WHERE product_id = ${productId}
        GROUP BY product_id
      ) sub
      WHERE p.id = sub.product_id
    `;
  });

  backTo(productSlug, "Review submitted!");
}


// src/app/lib/actions-store.ts
export async function undoPurchase(productId: string, slug: string) {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: string } | undefined;
    if (!user?.id) backTo(slug, "Please sign in.");

    const userId = String(user.id);
    const role = user.role ?? "buyer";
    const isAdmin = role === "admin";

    // Do NOT redirect inside the transaction — return a message instead.
    const msg = await sql.begin(async (trx) => {
        const del = await trx/*sql*/`
      DELETE FROM purchases
      WHERE user_id = ${userId} AND product_id = ${productId}
      RETURNING 1
    ` as unknown as { "?column?": number }[];

        if (del.length > 0) {
            await trx/*sql*/`
        UPDATE products
        SET stock = stock + 1, updated_at = now()
        WHERE id = ${productId}
      `;
            return "Purchase undone (stock restored).";
        }

        if (isAdmin) {
            await trx/*sql*/`
        UPDATE products
        SET stock = stock + 1, updated_at = now()
        WHERE id = ${productId}
      `;
            return "No purchase row found; stock incremented (admin override).";
        }

        return "No purchase found to undo.";
    });

    backTo(slug, msg); // redirect AFTER commit
}

