'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { sql } from '@/app/lib/db';

function backToRegister(msg: string) {
    const p = new URLSearchParams({ error: msg });
    redirect(`/auth/register?${p.toString()}`);
}

export async function registerUser(formData: FormData) {
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const confirm = String(formData.get('confirm') ?? '');
    const role = (String(formData.get('role') ?? 'buyer') === 'seller') ? 'seller' : 'buyer';

    if (!name || !email || !password) backToRegister('Please fill out all required fields.');
    if (password !== confirm) backToRegister('Passwords do not match.');
    if (password.length < 6) backToRegister('Password must be at least 6 characters.');

    const [exists] = await sql/*sql*/`SELECT 1 FROM users WHERE email = ${email} LIMIT 1`;
    if (exists) backToRegister('An account with that email already exists.');

    const hashed = await bcrypt.hash(password, 10);

    const [user] = await sql/*sql*/`
    INSERT INTO users (name, email, password, role)
    VALUES (${name}, ${email}, ${hashed}, ${role})
    RETURNING id, role
  `;

    if (user?.role === 'seller') {
        await sql/*sql*/`
      INSERT INTO shops (seller_id, display_name, bio, avatar_url, banner_url)
      VALUES (
        ${user.id},
        ${name + "'s Shop"},
        ${'Independent maker on Handcrafted Haven.'},
        ${''},
        ${''}
      )
      ON CONFLICT (seller_id) DO NOTHING
    `;
    }

    // Success → go to sign-in with flag
    redirect('/auth/sign-in?registered=1');
}
