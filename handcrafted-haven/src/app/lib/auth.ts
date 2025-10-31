import { getServerSession } from "next-auth";
import type { DefaultSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Use a type alias (intersection), not interface extends
export type UserSession = (DefaultSession["user"] & {
    id?: string;
    role?: string;
}) | undefined;

export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user as UserSession;
}
