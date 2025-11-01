import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../db/index";
import { customSession } from "better-auth/plugins";
import { createUserService } from "@/services/user";
import { AppError, mapToAppError } from "@/utils/errors";
import type { User } from "@prisma/client";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24 * 1,
	},
	databaseHooks: {
		user: {
			create: {
				before: async (userData, ctx) => {
					const body = ctx?.request?.body
						? JSON.parse(await new Response(ctx.request.body).text())
						: {};
					const groupId = body.groupId;
					return {
						data: {
							...userData,
							role: "USER",
							groupId: groupId ?? "",
						},
					};
				},
			},
		},
	},
	plugins: [
		customSession(async ({ user, session }) => {
			try {
				const result: User = await createUserService(prisma).getUserProfile(user.id);

				return {
					user: {
						...user,
						groupId: result.groupId,
					},
					session,
				};
			} catch (error) {
				console.log("Error while fetching groupId: ", error);
				const mappedError = mapToAppError(error);
				throw new AppError(mappedError.message, mappedError.statusCode, mappedError.code);
			}
		}),
	],
});
