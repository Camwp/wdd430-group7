import { Suspense } from "react";
import FiltersBar from "@/components/catalog/FiltersBar";
import ProductsGrid from "@/components/catalog/ProductsGrid";
import Pagination from "@/components/catalog/Pagination";
import { listCatalog } from "@/app/lib/catalog";

export const dynamic = "force-dynamic";

// helpers to normalize query values
function one(v: string | string[] | undefined): string | undefined {
    return Array.isArray(v) ? v[0] : v;
}
function num(v: string | string[] | undefined): number | undefined {
    const s = one(v);
    const n = s ? Number(s) : NaN;
    return Number.isFinite(n) ? n : undefined;
}

type CatalogSearchParams = {
    q?: string | string[];
    category?: string | string[];
    min?: string | string[];
    max?: string | string[];
    sort?: "new" | "price-asc" | "price-desc" | "rating" | string | string[];
    page?: string | string[];
};

export default async function CatalogPage({
    searchParams,
}: {
    // NOTE: in Next.js 16+, searchParams is a Promise
    searchParams: Promise<CatalogSearchParams>;
}) {
    const sp = await searchParams; // ✅ unwrap the promise

    const q = one(sp.q);
    const category = one(sp.category);
    const min = num(sp.min);
    const max = num(sp.max);
    const sort = one(sp.sort) as any;
    const page = num(sp.page) ?? 1;

    // Get meta for pagination
    const meta = await listCatalog({
        q, category, min, max, sort, page, pageSize: 12,
    });

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold">Catalog</h1>

            <FiltersBar />

            <Suspense fallback={<div className="py-6">Loading products…</div>}>
                <ProductsGrid
                    q={q}
                    category={category}
                    min={min}
                    max={max}
                    sort={sort}
                    page={page}
                    pageSize={12}
                />
            </Suspense>

            <Pagination totalPages={meta.totalPages} page={page} searchParams={sp as any} />
        </main>
    );
}
