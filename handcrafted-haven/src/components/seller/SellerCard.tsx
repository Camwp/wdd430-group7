import Link from "next/link";
import { shops } from "../../app/lib/placeholder-data";

export default function SellerCard({ seller }: { 
  seller: {
    id: string;
    display_name: string;
    bio?: string;
    avatar_url?: string;
  };
}) {
  return (
    <li className="rounded-2xl border p-4 shadow-sm flex flex-col items-center text-center">
      {seller.avatar_url && (
        <img
          src={seller.avatar_url}
          alt={seller.display_name}
          className="h-24 w-24 rounded-full object-cover mb-3"
        />
      )}
      <div className="font-semibold text-lg">{seller.display_name}</div>
      <div className="text-sm text-gray-500 mb-2">
        {seller.bio ?? "—"}
      </div>
      <Link
        className="mt-2 inline-block text-blue-600 underline"
        href={`/sellers/${seller.id}`}
      >
        View Profile
      </Link>
    </li>
  );
}
