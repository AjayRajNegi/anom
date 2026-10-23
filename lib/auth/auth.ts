import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, organization, twoFactor } from "better-auth/plugins";
import { addMemberToDemoOrf } from "../actions/auth/add-member-to-org";
import { env } from "../config/env";
import prisma from "../db/prisma";

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: "postgresql" }),

	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await addMemberToDemoOrf(user.id);
				},
			},
		},
	},

	emailAndPassword: {
		enabled: true,
		maxPasswordLength: 120,
		minPasswordLength: 8,
	},

	plugins: [
		admin({ adminRoles: ["admin"], defaultRole: "user" }),
		twoFactor(),
		nextCookies(),
		organization({ allowUserToCreateOrganization: false }),
	],

	session: {
		cookieCache: { enabled: true, maxAge: 5 * 60 },
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},

	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET,
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
});
