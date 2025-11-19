import Link from "next/link";

/** Minimal shop card. Link path can be changed later to /seller/[handle] */
export default function SellerCard(props: {
    id: string;
    name: string;
    bio?: string | null;
    avatar?: string | null;
    productCount?: number;
}) {
    const { id, name, bio, avatar, productCount = 0 } = props;

    return (
        <Link
            href={`/seller/${id}`}
            className="block overflow-hidden rounded-xl border border-neutral-200 bg-white hover:shadow"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={avatar || "/avatar.png"}
                alt=""
                className="h-40 w-full object-cover bg-neutral-100"
            />
            <div className="p-3">
                <div className="font-medium text-neutral-900">{name}</div>
                <div className="mt-1 text-xs text-neutral-600 line-clamp-2">
                    {bio || "—"}
                </div>
                <div className="mt-2 text-sm text-neutral-700">
                    {productCount} {productCount === 1 ? "product" : "products"}
                </div>
            </div>
        </Link>
    );
}
