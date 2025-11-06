import SignInForm from "./sign-in-form";

export const runtime = "nodejs";

export default function SignInPage({
    searchParams,
}: {
    searchParams?: { registered?: string; callbackUrl?: string };
}) {
    const registered = searchParams?.registered === "1";
    const callbackUrl = searchParams?.callbackUrl || "/";

    return (
        <main className="container mx-auto max-w-md px-4 py-10">
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className="mt-1 text-sm text-neutral-600">
                Welcome back to Handcrafted Haven.
            </p>

            {registered && (
                <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
                    Account created! You can sign in now.
                </div>
            )}

            <SignInForm callbackUrl={callbackUrl} />
        </main>
    );
}
