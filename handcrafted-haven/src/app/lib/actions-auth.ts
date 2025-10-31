'use server';

import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { sql } from '@/app/lib/db';

export async function registerUser(formData: FormData) {
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const confirm = String(formData.get('confirm') ?? '');
    const role = (String(formData.get('role') ?? 'buyer') === 'seller') ? 'seller' : 'buyer';

    if (!name || !email || !password) {
        return { error: 'Please fill out all required fields.' };
    }
    if (password !== confirm) {
        return { error: 'Passwords do not match.' };
    }
    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters.' };
    }

    const [exists] = await sql/*sql*/`
    SELECT 1 FROM users WHERE email = ${email} LIMIT 1
  `;
    if (exists) {
        return { error: 'An account with that email already exists.' };
    }

    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const [user] = await sql/*sql*/`
    INSERT INTO users (name, email, password, role)
    VALUES (${name}, ${email}, ${hashed}, ${role})
    RETURNING id, role
  `;

    // If they signed up as seller, create a default shop row
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

    // Send them to sign in with a success flash
    redirect('/auth/sign-in?registered=1');
}
