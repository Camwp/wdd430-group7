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

async function getAccount(userId: string): Promise<AccountRow | null> {
  const rows = await sql<AccountRow[]>`
    SELECT id, name, email, role, created_at
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

type ShopRow = {
  id: string;
  avatar_url: string | null;
  banner_url: string | null;
};

async function getSellerShop(userId: string): Promise<ShopRow | null> {
  const rows = await sql<ShopRow[]>`
    SELECT id, avatar_url, banner_url
    FROM shops
    WHERE seller_id = ${userId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as UserSession | undefined;

  if (!user?.id) {
    redirect("/auth/sign-in");
  }

  const sp = await searchParams;
  const userId = user.id;

  const account = await getAccount(userId);
  if (!account) {
    redirect("/auth/sign-in");
  }

  // ⬅️ NEW: load seller shop if applicable
  const shop = account.role === "seller" ? await getSellerShop(userId) : null;

  async function updateAccountAction(formData: FormData) {
    "use server";

    const innerSession = await getServerSession(authOptions);
    const innerUser = innerSession?.user as UserSession | undefined;

    if (!innerUser?.id) {
      redirect("/auth/sign-in");
    }

    const name = formData.get("name");
    if (typeof name !== "string" || !name.trim()) {
      redirect("/account/settings?msg=Name+is+required");
    }

    // ✅ Update users.name
    await sql`
      UPDATE users
      SET name = ${name.trim()}
      WHERE id = ${innerUser.id}
    `;

    // ✅ Also update shop avatar/banner for this user (no-op if they have no shop)
    const avatarUrl = formData.get("avatar_url");
    const bannerUrl = formData.get("banner_url");

    const avatarClean =
      typeof avatarUrl === "string" && avatarUrl.trim() !== ""
        ? avatarUrl.trim()
        : null;

    const bannerClean =
      typeof bannerUrl === "string" && bannerUrl.trim() !== ""
        ? bannerUrl.trim()
        : null;

    await sql`
      UPDATE shops
      SET
        avatar_url = ${avatarClean},
        banner_url = ${bannerClean}
      WHERE seller_id = ${innerUser.id}
    `;

    redirect("/account/settings?msg=Profile+updated");
  }

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold">Account Settings</h1>
        <Link
          href="/account"
          className="text-sm text-neutral-600 hover:underline"
        >
          ← Back to account
        </Link>
      </div>

      {sp.msg && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          {sp.msg}
        </div>
      )}

      <section className="max-w-xl">
        <form
          action={updateAccountAction}
          className="space-y-4 rounded-lg border bg-white p-6 shadow-sm"
        >
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-sm font-medium text-neutral-700"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={account.name ?? ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-neutral-700">Email</span>
            <p className="text-sm text-neutral-800 bg-neutral-50 rounded-md border px-3 py-2">
              {account.email}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-neutral-700">Role</span>
            <p className="text-sm text-neutral-800 bg-neutral-50 rounded-md border px-3 py-2 capitalize">
              {account.role}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-neutral-700">Joined</span>
            <p className="text-sm text-neutral-800 bg-neutral-50 rounded-md border px-3 py-2">
              {joinedDate}
            </p>
          </div>

          {/* ⬅️ NEW: seller-only shop fields */}
          {account.role === "seller" && (
            <>
              <hr className="my-4" />
              <h2 className="text-sm font-semibold text-neutral-800">
                Storefront appearance
              </h2>

              <div className="space-y-1">
                <label
                  htmlFor="avatar_url"
                  className="text-sm font-medium text-neutral-700"
                >
                  Avatar image URL
                </label>
                <input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  defaultValue={shop?.avatar_url ?? ""}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
                <p className="text-xs text-neutral-500">
                  This image appears as your shop avatar.
                </p>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="banner_url"
                  className="text-sm font-medium text-neutral-700"
                >
                  Banner image URL
                </label>
                <input
                  id="banner_url"
                  name="banner_url"
                  type="url"
                  defaultValue={shop?.banner_url ?? ""}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
                <p className="text-xs text-neutral-500">
                  This image appears at the top of your shop page.
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            className="mt-2 inline-flex items-center rounded-md border border-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-900 hover:text-white"
          >
            Save changes
          </button>
        </form>

        <p className="mt-3 text-xs text-neutral-500">
          You can update your account name, and if you are a seller, your shop
          avatar and banner images.
        </p>
      </section>
    </main>
  );
}
