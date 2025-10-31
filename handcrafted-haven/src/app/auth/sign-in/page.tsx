'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
    const qp = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const registered = qp.get('registered') === '1';
    const callbackUrl = qp.get('callbackUrl') || '/';

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
            callbackUrl,
        });

        setSubmitting(false);

        if (!res) {
            setError('Something went wrong.');
            return;
        }

        if (res.error) {
            setError('Invalid email or password.');
            return;
        }

        // Success: NextAuth returns { ok: true, url }
        window.location.href = res.url || callbackUrl;
    }

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

            {error && (
                <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    disabled={submitting}
                    className="w-full rounded-md bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-600 disabled:opacity-60"
                >
                    {submitting ? 'Signing in…' : 'Sign in'}
                </button>

                <p className="text-sm text-neutral-600">
                    New here?{' '}
                    <a className="text-emerald-700 underline-offset-2 hover:underline" href="/auth/register">
                        Create an account
                    </a>
                </p>
            </form>
        </main>
    );
}
