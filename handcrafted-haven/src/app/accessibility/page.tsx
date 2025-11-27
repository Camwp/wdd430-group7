import React from "react";

export default function AccessibilityPage() {
    return (
        <main className="min-h-screen bg-white text-gray-900">
            <section className="max-w-4xl mx-auto px-4 py-16">
                <header className="mb-8">
                    <p className="text-sm uppercase tracking-[0.15em] text-gray-500 mb-3">
                        Handcrafted Haven
                    </p>
                    <h1 className="text-3xl md:text-4xl font-semibold mb-3">
                        Accessibility Statement
                    </h1>
                    <p className="text-gray-700 max-w-2xl">
                        We want everyone to be able to discover, buy, and sell handmade
                        goods on Handcrafted Haven. Accessibility is an ongoing commitment,
                        not a one-time checklist.
                    </p>
                </header>

                {/* Our Commitment */}
                <section aria-labelledby="commitment-heading" className="mb-12">
                    <h2
                        id="commitment-heading"
                        className="text-xl font-semibold mb-2 text-gray-800"
                    >
                        Our Commitment
                    </h2>
                    <p className="text-gray-700 mb-3">
                        Handcrafted Haven strives to provide a digital experience that is
                        inclusive and usable for as many people as possible, including
                        people with disabilities. Our goal is to align with{" "}
                        <span className="font-semibold">
                            Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
                        </span>{" "}
                        wherever reasonably achievable.
                    </p>
                    <p className="text-gray-700">
                        Accessibility work is continuous. As we add new features, we review
                        them with accessibility in mind and make improvements regularly.
                    </p>
                </section>

                {/* Accessible Experience */}
                <section aria-labelledby="features-heading" className="mb-12">
                    <h2
                        id="features-heading"
                        className="text-xl font-semibold mb-2 text-gray-800"
                    >
                        How We Support Accessibility
                    </h2>
                    <p className="text-gray-700 mb-4">
                        Some steps we actively take to maintain and improve accessibility:
                    </p>

                    <ul className="space-y-3 text-gray-700 list-disc pl-5">
                        <li>
                            <strong>Keyboard navigation:</strong> core pages and actions
                            (product browsing, seller pages, cart, and checkout) are usable
                            with a keyboard alone.
                        </li>
                        <li>
                            <strong>Visible focus indicators:</strong> interactive elements
                            clearly show focus so users always know where they are on the
                            page.
                        </li>
                        <li>
                            <strong>Semantic HTML:</strong> headings, lists, buttons, and
                            landmark roles are used wherever appropriate to help assistive
                            technologies understand page structure.
                        </li>
                        <li>
                            <strong>Color & contrast:</strong> we aim for sufficient contrast
                            between text and background and avoid using color alone to convey
                            meaning.
                        </li>
                        <li>
                            <strong>Alternative text:</strong> product images and
                            non-decorative graphics include alt text so screen reader users
                            can understand visual content.
                        </li>
                        <li>
                            <strong>Clear forms:</strong> forms include associated labels,
                            helper text, and accessible error messaging.
                        </li>
                        <li>
                            <strong>Responsive layout:</strong> the interface adapts to
                            different screen sizes and supports zoom and larger text
                            preferences.
                        </li>
                    </ul>
                </section>

                {/* Ongoing Improvements */}
                <section aria-labelledby="ongoing-heading" className="mb-12">
                    <h2
                        id="ongoing-heading"
                        className="text-xl font-semibold mb-2 text-gray-800"
                    >
                        Ongoing Improvements
                    </h2>
                    <p className="text-gray-700 mb-3">
                        We regularly review new and existing features to identify
                        opportunities to improve accessibility. This includes:
                    </p>

                    <ul className="space-y-3 text-gray-700 list-disc pl-5">
                        <li>Reviewing design changes with accessibility guidelines.</li>
                        <li>Improving keyboard focus order and element labeling.</li>
                        <li>Fixing issues reported by users or automated tools.</li>
                    </ul>

                    <p className="text-gray-700 mt-3">
                        While we cannot guarantee perfection, we take accessibility issues
                        seriously and work to resolve them as quickly as possible.
                    </p>
                </section>

                {/* Feedback */}
                <section aria-labelledby="contact-heading" className="mb-12">
                    <h2
                        id="contact-heading"
                        className="text-xl font-semibold mb-2 text-gray-800"
                    >
                        Feedback & Contact
                    </h2>
                    <p className="text-gray-700 mb-4">
                        If you experience difficulty using Handcrafted Haven or have
                        suggestions on how we can improve accessibility, we encourage you to
                        reach out.
                    </p>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5">
                        <p className="font-medium text-gray-800 mb-1">How to reach us</p>
                        <p className="text-gray-700 mb-2">
                            Please include details such as:
                        </p>
                        <ul className="space-y-2 text-gray-700 list-disc pl-5 mb-3">
                            <li>The page or feature you were using</li>
                            <li>What you were trying to accomplish</li>
                            <li>Your browser or assistive technology</li>
                        </ul>
                        <p className="text-gray-800">
                            Email:{" "}
                            <a
                                href="mailto:support@handcraftedhaven.app"
                                className="underline underline-offset-4 hover:text-gray-900"
                            >
                                support@handcraftedhaven.app
                            </a>
                        </p>
                    </div>
                </section>

                {/* Last Updated */}
                <section aria-labelledby="date-heading">
                    <h2
                        id="date-heading"
                        className="text-xl font-semibold mb-2 text-gray-800"
                    >
                        Statement Last Updated
                    </h2>
                    <p className="text-gray-700">
                        This accessibility statement was last updated on{" "}
                        <time dateTime="2025-11-26">November 26, 2025</time>. We may update
                        it as the Handcrafted Haven platform evolves.
                    </p>
                </section>
            </section>
        </main>
    );
}
