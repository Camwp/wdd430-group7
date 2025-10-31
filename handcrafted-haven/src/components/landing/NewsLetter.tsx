// src/components/landing/Newsletter.tsx
export default function NewsLetter() {
    return (
        <section
            aria-labelledby="newsletter-title"
            className="mt-12 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
        >
            <h2 id="newsletter-title" className="text-xl font-semibold text-neutral-900">
                Get new finds in your inbox
            </h2>
            <p className="mt-1 max-w-prose text-neutral-600">
                Be first to discover fresh drops from independent makers. No spam, just good craft.
            </p>
            <form className="mt-4 flex max-w-lg gap-2" action="/api/newsletter" method="post">
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                    className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    Subscribe
                </button>
            </form>
            <p className="mt-2 text-xs text-neutral-500">
                By subscribing you agree to our <a className="underline" href="/privacy">Privacy Policy</a>.
            </p>
        </section>
    );
}
