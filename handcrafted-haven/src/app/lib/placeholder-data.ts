// deterministic UUIDs are fine for seed; use any you like
export const users = [
    { id: '5b7c2e8a-01a9-4d2b-9a6a-111111111111', name: 'Cameron Pedro', email: 'cam@example.com', password: 'devpass123', role: 'seller' },
    { id: '4b7c2e8a-01a9-4d2b-9a6a-222222222222', name: 'Zach Sutherland', email: 'zach@example.com', password: 'devpass123', role: 'seller' },
    { id: '4b7c2e8a-01a9-4d2b-9a6a-444444444444', name: 'Marry Jones', email: 'marry@example.com', password: 'devpass123', role: 'seller' },
    { id: '4b7c2e8a-01a9-4d2b-9a6a-555555555555', name: 'Mike Smith', email: 'mike@example.com', password: 'devpass123', role: 'seller' },
    { id: '3b7c2e8a-01a9-4d2b-9a6a-333333333333', name: 'Demo Buyer', email: 'buyer@example.com', password: 'demobuyer', role: 'buyer' },
];

export const shops = [
    {
        id: '6b7c2e8a-01a9-4d2b-9a6a-aaaaaaaaaaaa',
        seller_id: users[0].id,
        display_name: 'Cam’s Woodcraft',
        bio: 'Hand-carved home goods with a modern twist.',
        avatar_url: '/images/shops/cam-avatar.jpg',
        banner_url: '/images/shops/cam-banner.jpg',
    },
    {
        id: '6b7c2e8a-01a9-4d2b-9a6a-bbbbbbbbbbbb',
        seller_id: users[1].id,
        display_name: 'Zach’s Ceramics',
        bio: 'Small-batch pottery and stoneware.',
        avatar_url: '/images/shops/zach-avatar.jpg',
        banner_url: '/images/shops/zach-banner.jpg',
    },
    {
        id: '7b7c2e8e-01a7-5d1b-9a6a-cccccccccccc',
        seller_id: users[2].id,
        display_name: 'Marry’s Art',
        bio: 'Small-batch pottery and stoneware.',
        avatar_url: '/images/shops/marry-avatar.jpg',
        banner_url: '/images/shops/marry-banner.jpg',
    },
    {
        id: '9b9c2e7a-01a9-4d2b-9a6a-dddddddddddd',
        seller_id: users[3].id,
        display_name: 'Mike’s Metalworks',
        bio: 'Small-batch pottery and stoneware.',
        avatar_url: '/images/shops/mike-avatar.jpg',
        banner_url: '/images/shops/mike-banner.jpg',
    },
];

export const categories = [
    { id: '7b7c2e8a-01a9-4d2b-9a6a-aaaa00000001', slug: 'home-decor', name: 'Home Decor' },
    { id: '7b7c2e8a-01a9-4d2b-9a6a-aaaa00000002', slug: 'kitchen', name: 'Kitchen' },
    { id: '7b7c2e8a-01a9-4d2b-9a6a-aaaa00000003', slug: 'ceramics', name: 'Ceramics' },
    { id: '7b7c2e8a-01a9-4d2b-9a6a-aaaa00000004', slug: 'woodwork', name: 'Woodwork' },
    { id: '7b7c2e8a-01a9-4d2b-9a6a-aaaa00000005', slug: 'metalwork', name: 'Metalwork' },
    { id: '7b7c2e8a-01a9-4d2b-9a6a-aaaa00000006', slug: 'art', name: 'Art' },
];

export const products = [
    {
        id: '8b7c2e8a-01a9-4d2b-9a6a-000000000001',
        shop_id: shops[0].id,
        title: 'Walnut Charcuterie Board',
        description: 'Premium walnut board finished with food-safe oil.',
        price_cents: 8900,
        stock: 5,
        status: 'active',
    },
    {
        id: '8b7c2e8a-01a9-4d2b-9a6a-000000000002',
        shop_id: shops[1].id,
        title: 'Matte Stoneware Mug',
        description: '12oz hand-thrown mug with matte glaze.',
        price_cents: 3200,
        stock: 12,
        status: 'active',
    },
    {
        id: '8b7c2e8a-01a9-4d2b-9a6a-000000000003',
        shop_id: shops[2].id,
        title: 'Painting of a dog',
        description: 'large painting of a dog',
        price_cents: 3200,
        stock: 1,
        status: 'active',
    },
    {
        id: '8b7c2e8a-01a9-4d2b-9a6a-000000000004',
        shop_id: shops[3].id,
        title: 'Metal sign',
        description: '12in. metal welcome sign',
        price_cents: 3200,
        stock: 1,
        status: 'active',
    },
];

export const productImages = [
    { id: '9b7c2e8a-01a9-4d2b-9a6a-100000000001', product_id: products[0].id, url: '/images/products/board-1.jpg', sort_order: 0 },
    { id: '9b7c2e8a-01a9-4d2b-9a6a-100000000002', product_id: products[0].id, url: '/images/products/board-2.jpg', sort_order: 1 },
    { id: '9b7c2e8a-01a9-4d2b-9a6a-100000000003', product_id: products[1].id, url: '/images/products/mug-1.jpg', sort_order: 0 },
    { id: '9b7c2e8a-01a9-4d2b-9a6a-100000000004', product_id: products[2].id, url: '/images/products/dog-1.jpg', sort_order: 0 },
    { id: '9b7c2e8a-01a9-4d2b-9a6a-100000000005', product_id: products[3].id, url: '/images/products/sign-1.jpg', sort_order: 0 },
];

export const productCats = [
    { product_id: products[0].id, category_id: categories[1].id }, // kitchen
    { product_id: products[0].id, category_id: categories[4 - 1].id }, // woodwork
    { product_id: products[1].id, category_id: categories[2].id }, // ceramics
    { product_id: products[2].id, category_id: categories[4].id }, // art
    { product_id: products[3].id, category_id: categories[5].id }, // metalworking
];

export const reviews = [
    {
        id: 'ab7c2e8a-01a9-4d2b-9a6a-200000000001',
        product_id: products[0].id,
        author_id: users[2].id,
        rating: 5,
        title: 'Gorgeous board!',
        body: 'Great finish, arrived fast. Makes a perfect gift.',
    },
    {
        id: 'ab7c2e8a-01a9-4d2b-9a6a-200000000002',
        product_id: products[1].id,
        author_id: users[2].id,
        rating: 4,
        title: 'Nice mug',
        body: 'Love the glaze, handle could be a bit thicker.',
    },
];
