"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SellersFiltersBar() {
    const router = useRouter();
    const sp = useSearchParams();

    const [q, setQ] = useState(sp.get("q") ?? "");
    const [sort, setSort] = useState(sp.get("sort") ?? "new");

    useEffect(() => {
        setQ(sp.get("q") ?? "");
        setSort(sp.get("sort") ?? "new");
    }, [sp]);

    function apply() {
        const p = new URLSearchParams(sp.toString());
        q ? p.set("q", q) : p.delete("q");
        sort ? p.set("sort", sort) : p.delete("sort");
        p.set("page", "1");
        router.push(`/sellers?${p.toString()}`);
        router.refresh();
    }

    function reset() {
        router.push("/sellers");
        router.refresh();
    }

    return (
        <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search sellers…"
                className="w-64 rounded-md border border-neutral-300 px-3 py-2"
                aria-label="Search sellers"
            />
            <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-md border border-neutral-300 bg-white px-3 py-2"
                aria-label="Sort sellers"
            >
                <option value="new">Newest</option>
                <option value="name">Name A–Z</option>
                <option value="popular">Most products</option>
            </select>

            <button
                onClick={apply}
                className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            >
                Apply
            </button>
            <button
                onClick={reset}
                className="rounded-md border px-4 py-2 hover:bg-neutral-50"
            >
                Reset
            </button>
        </div>
    );
}
