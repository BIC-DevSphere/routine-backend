import type { PrismaClient, User } from "@prisma/client";
import { NotFoundError } from "@/utils/errors";

export type UserService = {
	getUserProfile(userId: string): Promise<User>;
};

export function createUserService(prisma: PrismaClient): UserService {
	return {
		async getUserProfile(userId: string) {
			const user = await prisma.user.findUnique({
				where: {
					id: userId,
				},
			});
			if (!user) throw new NotFoundError("user");

			return user;
		},
	};
}
