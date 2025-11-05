import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../db/index";
import { customSession } from "better-auth/plugins";
import { createUserService } from "@/services/user";
import { AppError, mapToAppError } from "@/utils/errors";
import type { User } from "@prisma/client";
import {expo} from "@better-auth/expo"

export const auth = betterAuth({
	trustedOrigins: [process.env.TRUSTED_ORIGIN || ""]
	,
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
	user: {
		additionalFields: {
			groupId: {
				type: "string",
				required: true,
			},
		},
	},
	databaseHooks: {
		user: {
			create: {
				before: async (userData, ctx) => {
					const groupId = (ctx as any)?.body?.groupId ?? "";
					
					if (!groupId || groupId.trim() === "") {
						throw new AppError("groupId is required and cannot be empty", 400, "VALIDATION_ERROR");
					}
					
					return {
						data: {
							...userData,
							role: "USER",
							groupId,
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
		expo()
	],
});
