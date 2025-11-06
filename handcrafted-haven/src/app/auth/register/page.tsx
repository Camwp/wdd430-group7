import { registerUser } from '@/app/lib/actions-auth';

export const runtime = 'nodejs';

export default function RegisterPage() {
    return (
        <main className="container mx-auto max-w-md px-4 py-10">
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="mt-1 text-sm text-neutral-600">
                Join the community. Buy unique goods or open a seller shop.
            </p>

            <form action={registerUser} className="mt-6 space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">Name</label>
                    <input
                        id="name"
                        name="name"
                        required
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="Your name"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                        placeholder="you@example.com"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm" className="block text-sm font-medium">Confirm password</label>
                        <input
                            id="confirm"
                            name="confirm"
                            type="password"
                            required
                            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-medium">I am a</label>
                    <select
                        id="role"
                        name="role"
                        className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                        defaultValue="buyer"
                    >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller (creates a shop)</option>
                    </select>
                </div>

                <button
                    className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    Create account
                </button>

                <p className="text-sm text-neutral-600">
                    Already have an account?{' '}
                    <a className="text-emerald-700 underline-offset-2 hover:underline" href="/auth/sign-in">
                        Sign in
                    </a>
                </p>
            </form>
        </main>
    );
}
