import {
	adminClient,
	organizationClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
	plugins: [adminClient(), twoFactorClient(), organizationClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
