import { getServerSession } from "next-auth";
import type { DefaultSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface UserSession extends DefaultSession["user"] {
    id?: string;
    role?: string;
}

export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user as UserSession | undefined;
}
