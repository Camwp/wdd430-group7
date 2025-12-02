import SellerCard from "@/components/sellers/SellerCard";
import { listSellers } from "@/app/lib/shop";

export default async function SellersGrid(props: {
  q?: string;
  sort?: "new" | "name" | "popular";
  page?: number;
  pageSize?: number;
}) {
  const { rows } = await listSellers({
    q: props.q,
    sort: props.sort,
    page: props.page ?? 1,
    pageSize: props.pageSize ?? 12,
  });

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((s) => (
        <SellerCard
          key={s.id}
          id={s.id}
          slug={s.slug}
          name={s.display_name}
          bio={s.bio}
          avatar={s.avatar_url}
          productCount={s.product_count}
        />
      ))}
    </div>
  );
}
