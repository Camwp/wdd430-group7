import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { signOut } from "next-auth/react";
import { UserSession } from "@/app/lib/auth";
import SignOutButton from "../auth/SignOutButton";

export default async function Navbar() {
    const session = await getServerSession(authOptions);
    const user = session?.user as UserSession | undefined;

    return (
        <nav
            aria-label="Primary"
            className="container mx-auto flex items-center justify-between p-4"
        >
            <Link href="/" className="text-lg font-semibold">
                Handcrafted Haven
            </Link>

            <ul className="flex items-center gap-6">
                <li>
                    <Link className="hover:underline" href="/catalog">
                        Catalog
                    </Link>
                </li>
                <li>
                    <Link className="hover:underline" href="/sellers">
                        Sellers
                    </Link>
                </li>

                {!user && (
                    <>
                        <li>
                            <Link
                                className="rounded-md border px-3 py-1.5 hover:bg-neutral-50"
                                href="/auth/sign-in"
                            >
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
                                href="/auth/register"
                            >
                                Register
                            </Link>
                        </li>
                    </>
                )}

                {user && (
                    <li className="flex items-center gap-3">
                        <Link
                            className="rounded-md bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-800"
                            href="/account"
                        >
                            My Profile
                        </Link>
                        <SignOutButton />
                    </li>
                )}
            </ul>
        </nav>
    );
}
