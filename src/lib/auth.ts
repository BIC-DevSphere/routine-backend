import { expo } from "@better-auth/expo";
import type { User } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins";
import { createUserService } from "@/services/user.service";
import { AppError, mapToAppError } from "@/utils/errors";
import prisma from "../db/index";
import sendEmail from "./email/sendEmail";

export const auth = betterAuth({
	trustedOrigins: [process.env.TRUSTED_ORIGIN || "http://localhost:8081"],
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async (data) => {
			await sendEmail({
				to: data.user.email,
				name: data.user.name,
				link: data.url,
				subject: "Password reset",
				type: "RESET_PASSWORD",
			});
		},
	},

	emailVerification: {
		sendVerificationEmail: async (data) => {
			await sendEmail({
				to: data.user.email,
				name: data.user.name,
				link: data.url,
				subject: "Verify email address",
				type: "EMAIL_VERIFY",
			});
		},
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
				before: async (userData: Record<string, any>, ctx?: any) => {
					const groupId = ctx?.body?.groupId ?? "";

					if (!groupId || groupId.trim() === "") {
						throw new AppError(
							"groupId is required and cannot be empty",
							400,
							"VALIDATION_ERROR",
						);
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
				const result: User = await createUserService(prisma).getUserProfile(
					user.id,
				);

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
				throw new AppError(
					mappedError.message,
					mappedError.statusCode,
					mappedError.code,
				);
			}
		}),
		expo(),
	],
});
