"use client";

import { useState } from "react";

export default function ProductGallery({ images }: { images: { url: string }[] }) {
    const safe = images.length ? images : [{ url: "/placeholder-product.jpg" }];
    const [active, setActive] = useState(0);

    return (
        <div>
            {/* main */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={safe[active]?.url || "/placeholder-product.jpg"}
                alt=""
                className="w-full rounded-xl border object-cover aspect-[4/3] bg-neutral-100"
            />

            {/* thumbs */}
            {safe.length > 1 && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                    {safe.map((img, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            key={img.url + i}
                            src={img.url}
                            alt=""
                            onClick={() => setActive(i)}
                            className={`h-20 w-full cursor-pointer rounded-md border object-cover ${i === active ? "ring-2 ring-emerald-500" : ""
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
