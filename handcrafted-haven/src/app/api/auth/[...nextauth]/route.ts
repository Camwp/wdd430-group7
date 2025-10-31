import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { sql } from "@/app/lib/db";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    pages: { signIn: "/auth/sign-in" },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null;

                const [user] = await sql/*sql*/`
          SELECT id, name, email, password, role
          FROM users
          WHERE email = ${credentials.email}
          LIMIT 1
        `;
                if (!user) return null;

                const ok = await bcrypt.compare(credentials.password, user.password);
                if (!ok) return null;

                return { id: user.id, name: user.name, email: user.email, role: user.role } as any;
            },
        }),
    ],
    callbacks: {
        async jwt(
            { token, user }: { token: JWT; user?: { id: string; name?: string | null; email?: string | null; role?: string } }
        ): Promise<JWT> {
            if (user) {
                // attach minimal user info to the token
                (token as any).user = { id: user.id, name: user.name, email: user.email, role: user.role };
            }
            return token;
        },
        async session(
            { session, token }: { session: Session; token: JWT }
        ): Promise<Session> {
            const tUser = (token as any).user;
            if (tUser) {
                (session as any).user = tUser;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
