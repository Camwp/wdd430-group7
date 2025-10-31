import bcrypt from 'bcrypt';
import { sql } from '@/app/lib/db';
import { users, shops, categories, products, productImages, productCats, reviews } from '@/app/lib/placeholder-data';

export const runtime = 'nodejs';

async function ensureExtensions() {
  // use uuid-ossp or pgcrypto; pick one
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  // If your provider prefers pgcrypto:
  // await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
}

async function createTables() {
  await ensureExtensions();

  // USERS
  await sql/*sql*/`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer','seller','admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // SHOPS (one-to-one users(id)->shops(seller_id) for sellers)
  await sql/*sql*/`
    CREATE TABLE IF NOT EXISTS shops (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      seller_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      display_name TEXT NOT NULL,
      bio TEXT,
      avatar_url TEXT,
      banner_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // CATEGORIES
  await sql/*sql*/`
    CREATE TABLE IF NOT EXISTS categories (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL
    );
  `;

  // PRODUCTS
  await sql/*sql*/`
    CREATE TABLE IF NOT EXISTS products (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      price_cents INT NOT NULL CHECK (price_cents >= 0),
      stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived','sold_out')),
      rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00,
      rating_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // PRODUCT IMAGES
  await sql/*sql*/`
    CREATE TABLE IF NOT EXISTS product_images (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0
    );
  `;

  // PRODUCT <-> CATEGORIES (M2M)
  await sql/*sql*/`
    CREATE TABLE IF NOT EXISTS product_categories (
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (product_id, category_id)
    );
  `;

  // REVIEWS
  await sql/*sql*/`
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title TEXT,
      body TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // Indexes that matter
  await sql`CREATE INDEX IF NOT EXISTS products_shop_id_idx ON products(shop_id)`;
  await sql`CREATE INDEX IF NOT EXISTS products_status_idx ON products(status)`;
  await sql`CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON reviews(product_id)`;
  await sql`CREATE INDEX IF NOT EXISTS product_categories_cat_idx ON product_categories(category_id)`;
}

async function seedUsers() {
  await Promise.all(users.map(async u => {
    const hashed = await bcrypt.hash(u.password, 10);
    return sql/*sql*/`
      INSERT INTO users (id, name, email, password, role)
      VALUES (${u.id}, ${u.name}, ${u.email}, ${hashed}, ${u.role})
      ON CONFLICT (id) DO NOTHING;
    `;
  }));
}

async function seedShops() {
  await Promise.all(shops.map(s => sql/*sql*/`
    INSERT INTO shops (id, seller_id, display_name, bio, avatar_url, banner_url)
    VALUES (${s.id}, ${s.seller_id}, ${s.display_name}, ${s.bio}, ${s.avatar_url}, ${s.banner_url})
    ON CONFLICT (id) DO NOTHING;
  `));
}

async function seedCategories() {
  await Promise.all(categories.map(c => sql/*sql*/`
    INSERT INTO categories (id, slug, name)
    VALUES (${c.id}, ${c.slug}, ${c.name})
    ON CONFLICT (id) DO NOTHING;
  `));
}

async function seedProducts() {
  await Promise.all(products.map(p => sql/*sql*/`
    INSERT INTO products (id, shop_id, title, description, price_cents, stock, status)
    VALUES (
      ${p.id}, ${p.shop_id}, ${p.title}, ${p.description},
      ${p.price_cents}, ${p.stock}, ${p.status}
    )
    ON CONFLICT (id) DO NOTHING;
  `));
}

async function seedProductImages() {
  await Promise.all(productImages.map(img => sql/*sql*/`
    INSERT INTO product_images (id, product_id, url, sort_order)
    VALUES (${img.id}, ${img.product_id}, ${img.url}, ${img.sort_order})
    ON CONFLICT (id) DO NOTHING;
  `));
}

async function seedProductCategories() {
  await Promise.all(productCats.map(pc => sql/*sql*/`
    INSERT INTO product_categories (product_id, category_id)
    VALUES (${pc.product_id}, ${pc.category_id})
    ON CONFLICT DO NOTHING;
  `));
}

async function seedReviews() {
  await Promise.all(reviews.map(r => sql/*sql*/`
    INSERT INTO reviews (id, product_id, author_id, rating, title, body)
    VALUES (${r.id}, ${r.product_id}, ${r.author_id}, ${r.rating}, ${r.title}, ${r.body})
    ON CONFLICT (id) DO NOTHING;
  `));

  // Update product rating aggregates
  await sql/*sql*/`
    UPDATE products p
    SET rating_avg = sub.avg_rating,
        rating_count = sub.cnt
    FROM (
      SELECT product_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS cnt
      FROM reviews
      GROUP BY product_id
    ) sub
    WHERE sub.product_id = p.id;
  `;
}

export async function GET() {
  try {
    await sql.begin(async () => {
      await createTables();
      await seedUsers();
      await seedShops();
      await seedCategories();
      await seedProducts();
      await seedProductImages();
      await seedProductCategories();
      await seedReviews();
    });

    return Response.json({ message: 'Seeded Handcrafted Haven successfully' });
  } catch (error) {
    console.error(error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
