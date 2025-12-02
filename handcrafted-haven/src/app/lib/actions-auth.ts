'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { sql } from '@/app/lib/db';
import { slugify } from "@/app/lib/utils";

function backToRegister(msg: string) {
    const p = new URLSearchParams({ error: msg });
    redirect(`/auth/register?${p.toString()}`);
}

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const role =
    String(formData.get("role") ?? "buyer") === "seller" ? "seller" : "buyer";

  if (!name || !email || !password)
    backToRegister("Please fill out all required fields.");
  if (password !== confirm) backToRegister("Passwords do not match.");
  if (password.length < 6)
    backToRegister("Password must be at least 6 characters.");

  const [exists] =
    await sql `SELECT 1 FROM users WHERE email = ${email} LIMIT 1`;
  if (exists) backToRegister("An account with that email already exists.");

  const hashed = await bcrypt.hash(password, 10);

  const [user] = await sql `
    INSERT INTO users (name, email, password, role)
    VALUES (${name}, ${email}, ${hashed}, ${role})
    RETURNING id, role
  `;

  if (user?.role === "seller") {
    const shopName = `${name}'s Shop`;
    const shopSlug = slugify(shopName);

    await sql `
      INSERT INTO shops (seller_id, display_name, bio, avatar_url, banner_url, slug)
      VALUES (
        ${user.id},
        ${shopName},
        ${"Independent maker on Handcrafted Haven."},
        ${""},
        ${""},
        ${shopSlug}
      )
      ON CONFLICT (seller_id) DO NOTHING
    `;
  }

  redirect("/auth/sign-in?registered=1");
}
