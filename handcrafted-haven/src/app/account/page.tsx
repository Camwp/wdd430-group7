import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sql } from "@/app/lib/db";
import Link from "next/link";
import type { UserSession } from "@/app/lib/auth";

type AccountRow = {
  id: string;
  name: string | null;
  email: string;
  role: "buyer" | "seller";
  created_at: string;
};

type ShopRow = {
  id: string;
  seller_id: string;
  display_name: string;
  slug: string;
};


async function getAccount(userId: string): Promise<AccountRow | null> {
  const rows = await sql<AccountRow[]>`
    SELECT id, name, email, role, created_at
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

async function getSellerShop(userId: string): Promise<ShopRow | null> {
  const rows = await sql<ShopRow[]>`
    SELECT id, seller_id, display_name, slug
    FROM shops
    WHERE seller_id = ${userId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as UserSession | undefined;

  if (!user?.id) {
    redirect("/auth/sign-in");
  }

  const userId = user.id;
  const account = await getAccount(userId);

  if (!account) {
    redirect("/auth/sign-in");
  }

  const shop = account.role === "seller" ? await getSellerShop(userId) : null;

  const joinedDate = new Date(account.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <main className="container mx-auto px-4 py-12 space-y-8">
      <section className="max-w-xl space-y-4">
        <h1 className="text-3xl font-semibold">My Account</h1>

        <div className="rounded-lg border bg-white p-6 shadow-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Name</span>
            <span className="text-sm">{account.name ?? "—"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Email</span>
            <span className="text-sm">{account.email}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Role</span>
            <span className="text-sm capitalize">{account.role}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-neutral-600">Joined</span>
            <span className="text-sm">{joinedDate}</span>
          </div>
        </div>

        <p className="text-xs text-neutral-500">
          Password and internal ID are stored securely and are not displayed
          here.
        </p>
      </section>

      <section className="max-w-xl space-y-4">
        <h2 className="text-xl font-semibold">Account Actions</h2>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/account/settings"
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Account settings
          </Link>

          <Link
            href="/account/purchases"
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            View purchases
          </Link>

          {account.role === "seller" && shop && (
            <Link
              href={`/seller/${shop.slug}`}
              className="rounded-md border border-emerald-600 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Go to storefront
            </Link>
          )}
        </div>

        {account.role === "seller" && (
          <p className="text-sm text-neutral-600">
            As a seller, your storefront is where you can add, edit, and manage
            your products.
          </p>
        )}
      </section>
    </main>
  );
}
