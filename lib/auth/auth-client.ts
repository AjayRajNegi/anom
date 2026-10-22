import { adminClient } from "better-auth/client/plugins";
import { organization, twoFactorClient } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
	plugins: [adminClient(), twoFactorClient(), organization()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
