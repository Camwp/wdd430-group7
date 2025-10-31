import postgres from 'postgres';

if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not set');
}

export const sql = postgres(process.env.POSTGRES_URL, {
    ssl: 'require',       // keep for hosted DB; local PG will ignore if not needed
    max: 3,               // light pooling for serverless
});

export async function closeSql() {
    await sql.end({ timeout: 5 });
}
