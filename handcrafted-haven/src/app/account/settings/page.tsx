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

    await sql`
      UPDATE users
      SET name = ${name.trim()}
      WHERE id = ${innerUser.id}
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

          <button
            type="submit"
            className="mt-2 inline-flex items-center rounded-md border border-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-900 hover:text-white"
          >
            Save changes
          </button>
        </form>

        <p className="mt-3 text-xs text-neutral-500">
          Only account name is able to be changed at this time.
        </p>
      </section>
    </main>
  );
}
