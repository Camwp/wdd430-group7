import { Suspense } from "react";
import SellersFiltersBar from "@/components/sellers/SellersFilterBar";
import SellersGrid from "@/components/sellers/SellersGrid";
import { listSellers } from "@/app/lib/shop";
import Pagination from "@/components/catalog/Pagination"; // reuse your existing one

export const dynamic = "force-dynamic";

function one(v?: string | string[]) {
    return Array.isArray(v) ? v[0] : v;
}
function num(v?: string | string[]) {
    const s = one(v);
    const n = s ? Number(s) : NaN;
    return Number.isFinite(n) ? n : undefined;
}

export default async function SellersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string | string[]; sort?: string | string[]; page?: string | string[] }>;
}) {
    const sp = await searchParams;
    const q = one(sp.q);
    const sort = (one(sp.sort) as "new" | "name" | "popular" | undefined) ?? "new";
    const page = num(sp.page) ?? 1;

    const meta = await listSellers({ q, sort, page, pageSize: 12 });

    return (
        <main className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold">Sellers</h1>

            <SellersFiltersBar />

            <Suspense fallback={<div className="py-6">Loading sellers…</div>}>
                <SellersGrid q={q} sort={sort} page={page} pageSize={12} />
            </Suspense>

            <div className="mt-8">
                <Pagination totalPages={meta.totalPages} page={page} searchParams={{ q, sort }} />
            </div>
        </main>
    );
}
