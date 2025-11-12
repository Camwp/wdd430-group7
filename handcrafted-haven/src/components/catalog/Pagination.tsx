import Link from "next/link";

export default function Pagination({
    totalPages,
    page,
    searchParams,
}: {
    totalPages: number;
    page: number;
    searchParams?: Record<string, string | string[] | undefined>;
}) {
    if (totalPages <= 1) return null;

    const sp = new URLSearchParams();
    Object.entries(searchParams || {}).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((x) => x && sp.append(k, x));
        else if (v) sp.set(k, String(v));
    });

    const linkFor = (p: number) => {
        const s = new URLSearchParams(sp);
        s.set("page", String(p));
        return `/catalog?${s.toString()}`;
    };

    return (
        <div className="mt-8 flex items-center justify-center gap-2">
            <Link
                className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-50"
                href={linkFor(Math.max(1, page - 1))}
                aria-disabled={page === 1}
            >
                Prev
            </Link>
            <span className="px-2 text-sm text-neutral-700">
                Page {page} of {totalPages}
            </span>
            <Link
                className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-50"
                href={linkFor(Math.min(totalPages, page + 1))}
                aria-disabled={page === totalPages}
            >
                Next
            </Link>
        </div>
    );
}
