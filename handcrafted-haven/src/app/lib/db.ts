// src/app/lib/db.ts
import postgres, { type Sql } from 'postgres';

if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not set');
}

// Note: some hosts like a string 'require'; cast to any to satisfy types.
export const sql: Sql = postgres(process.env.POSTGRES_URL, {
    ssl: 'require' as any,
    max: 3,
});

export async function closeSql() {
    await sql.end({ timeout: 5 });
}
