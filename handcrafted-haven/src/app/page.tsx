// src/app/(site)/page.tsx
import Hero from "@/components/landing/Hero";
import CategoryChips from "@/components/landing/CategoryChips";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import ArtisanStrip from "@/components/landing/ArtisanStrip";
import NewsLetter from "@/components/landing/NewsLetter";

export default function HomePage() {
    return (
        <div className="space-y-10">
            <Hero />
            <CategoryChips />
            <FeaturedProducts />
            <ArtisanStrip />
            <NewsLetter />
        </div>
    );
}
