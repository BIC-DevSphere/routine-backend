import type { PrismaClient, User } from "@prisma/client";
import { DatabaseError, mapToAppError, NotFoundError } from "@/utils/errors";

export type UserService = {
	getUserProfile(userId: string): Promise<User>;
	getAllUsers(): Promise<User[]>;
	updateUser(userId: string, data: Partial<User>): Promise<User>;
	deleteUser(userId: string): Promise<void>;
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

		async getAllUsers() {
			try {
				const users = await prisma.user.findMany({
					orderBy: {
						createdAt: "desc",
					},
				});
				if (!users || users.length === 0) {
					throw new NotFoundError("users");
				}
				return users;
			} catch (error) {
				console.error("Error fetching users:", error);
				throw mapToAppError(error);
			}
		},

		async updateUser(userId: string, data: Partial<User>) {
			try {
				const user = await prisma.user.update({
					where: {
						id: userId,
					},
					data,
				});
				if (!user) throw new DatabaseError("Failed to update user");
				return user;
			} catch (error) {
				console.error("Error updating user:", error);
				throw mapToAppError(error);
			}
		},

		async deleteUser(userId: string) {
			try {
				const result = await prisma.user.delete({
					where: {
						id: userId,
					},
				});
				if (!result) throw new DatabaseError("Failed to delete user");
				return;
			} catch (error) {
				console.error("Error deleting user:", error);
				throw mapToAppError(error);
			}
		},
	};
}
