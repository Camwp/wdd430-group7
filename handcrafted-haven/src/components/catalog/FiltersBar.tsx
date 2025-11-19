"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function FiltersBar() {
    const router = useRouter();
    const sp = useSearchParams();

    const [q, setQ] = useState(sp.get("q") || "");
    const [category, setCategory] = useState(sp.get("category") || "");
    const [min, setMin] = useState(sp.get("min") || "");
    const [max, setMax] = useState(sp.get("max") || "");
    const [sort, setSort] = useState(sp.get("sort") || "new");

    useEffect(() => {
        setQ(sp.get("q") || "");
        setCategory(sp.get("category") || "");
        setMin(sp.get("min") || "");
        setMax(sp.get("max") || "");
        setSort(sp.get("sort") || "new");
    }, [sp]);

    const apply = useCallback((page?: number) => {
        const p = new URLSearchParams(sp.toString());
        q ? p.set("q", q) : p.delete("q");
        category ? p.set("category", category) : p.delete("category");
        min ? p.set("min", min) : p.delete("min");
        max ? p.set("max", max) : p.delete("max");
        sort ? p.set("sort", sort) : p.delete("sort");
        p.set("page", String(page ?? 1));
        router.push(`/catalog?${p.toString()}`);
        router.refresh(); // <- ensure server components re-run with new params
    }, [router, sp, q, category, min, max, sort]);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        apply(1);
    }

    return (
        <form onSubmit={onSubmit} className="mb-6 rounded-xl border border-neutral-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search products…"
                    className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Category slug (e.g. ceramics)"
                    className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <input
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                    inputMode="decimal"
                    placeholder="Min $"
                    className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <input
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    inputMode="decimal"
                    placeholder="Max $"
                    className="rounded-md border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-md border border-neutral-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                >
                    <option value="new">Newest</option>
                    <option value="price-asc">Price ↑</option>
                    <option value="price-desc">Price ↓</option>
                    <option value="rating">Top rated</option>
                </select>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
                    >
                        Apply
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setQ(""); setCategory(""); setMin(""); setMax(""); setSort("new");
                            router.push("/catalog");
                            router.refresh();
                        }}
                        className="rounded-md border px-4 py-2 hover:bg-neutral-50"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </form>
    );
}
