import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sql } from "@/app/lib/db";
import Link from "next/link";
import type { UserSession } from "@/app/lib/auth";

type PurchaseRow = {
  id: string;
  created_at: string;
  price_cents: number;
  quantity: number;
  product_title: string;
  product_id: string;
};

async function getUserPurchases(userId: string): Promise<PurchaseRow[]> {
  const rows = await sql<PurchaseRow[]>`
    SELECT
      p.id,
      p.created_at,
      pr.price_cents,
      1::int AS quantity,              -- no quantity in purchases, assume 1
      pr.title       AS product_title,
      pr.id          AS product_id
    FROM purchases p
    JOIN products pr ON pr.id = p.product_id
    WHERE p.user_id = ${userId}
    ORDER BY p.created_at DESC
  `;
  return rows;
}

export default async function AccountPurchasesPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as UserSession | undefined;

  if (!user?.id) {
    redirect("/auth/sign-in");
  }

  const userId = user.id;
  const purchases = await getUserPurchases(userId);

  return (
    <main className="container mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold">Your Purchases</h1>

        <Link
          href="/account"
          className="text-sm text-neutral-600 hover:underline"
        >
          ← Back to account
        </Link>
      </div>
        <p>To leave a review, visit the product page.</p>

      {purchases.length === 0 ? (
        <p className="text-neutral-600">
          You have not made any purchases yet.
        </p>
      ) : (
        <section className="space-y-4 max-w-2xl">
          {purchases.map((order) => {
            const date = new Date(order.created_at).toLocaleDateString(
              undefined,
              { year: "numeric", month: "long", day: "numeric" }
            );

            const total =
              typeof order.price_cents === "number"
                ? (order.price_cents / 100).toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                  })
                : "—";

            return (
              <article
                key={order.id}
                className="rounded-lg border bg-white p-4 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">{order.product_title}</h2>
                  <span className="text-xs text-neutral-500">
                    Order ID: {order.id}
                  </span>
                </div>

                <p className="text-sm text-neutral-700">
                  Quantity: {order.quantity}
                </p>

                <p className="text-sm text-neutral-700">Date: {date}</p>

                <p className="text-sm font-semibold text-neutral-900">
                  Total: {total}
                </p>

                <div className="mt-2">
                  <Link
                    href={`/product/${order.product_id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View product
                  </Link>
                  
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
