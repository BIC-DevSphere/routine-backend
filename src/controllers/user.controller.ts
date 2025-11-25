import type { User } from "@prisma/client";
import type { Request, Response } from "express";
import type { UserService } from "@/services/user.service";
import { mapToAppError, ValidationError } from "@/utils/errors";
import { sanitizeUpdateObject } from "@/utils/sanitizeObject";
import { BaseController } from "./base";

class UserController extends BaseController {
	constructor(private userService: UserService) {
		super();
	}
	async getUserProfile(req: Request, res: Response) {
		try {
			const userId = req.userId;

			if (!userId) {
				throw new ValidationError("User ID is required");
			}
			const user = await this.userService.getUserProfile(userId);
			this.sendSuccess(res, user, "User profile fetched successfully");
		} catch (error) {
			console.error("Error in getUserProfile:", error);
			this.sendError(res, mapToAppError(error));
		}
	}

	async updateUserProfile(req: Request, res: Response) {
		const userId = req.userId;
		if (!userId) throw new ValidationError("User ID is required");
		await this.handleUserUpdate(userId, req.body, res);
	}

	// Admin Controllers
	async getAllUsers(_req: Request, res: Response) {
		try {
			const users = await this.userService.getAllUsers();
			this.sendSuccess(res, users, "Users fetched successfully");
		} catch (error) {
			console.error("Error in getAllUsers:", error);
			this.sendError(res, mapToAppError(error));
		}
	}

	async updateUserByAdmin(req: Request, res: Response) {
		const userId = req.params.id;
		if (!userId) throw new ValidationError("User ID is required");

		// In future, we can allow admin to update more fields like group.
		await this.handleUserUpdate(userId, req.body, res, [
			"name",
			"emailVerified",
			"groupId",
			"role",
		]);
	}

	async deleteUserByAdmin(req: Request, res: Response) {
		try {
			const userId = req.params.id;
			if (!userId) throw new ValidationError("User ID is required");

			const deletedUser = await this.userService.deleteUser(userId);
			this.sendSuccess(res, deletedUser, `User ${userId} deleted successfully`);
		} catch (error) {
			console.error("Error in deleting user", error);
			this.sendError(res, mapToAppError(error));
		}
	}

	private async handleUserUpdate(
		userId: string,
		updates: any,
		res: Response,
		allowedFields: (keyof User)[] = ["name"],
	) {
		try {
			const extraFields = Object.keys(updates).filter(
				(key) => !allowedFields.includes(key as keyof User),
			);
			if (extraFields.length > 0) {
				throw new ValidationError(
					`The following fields are not allowed: ${extraFields.join(", ")}`,
				);
			}

			const filteredUpdates = this.filterAllowedFields(updates, allowedFields);

			const sanitizedUpdates = sanitizeUpdateObject(
				filteredUpdates,
			) as Partial<User>;

			if (!sanitizedUpdates || Object.keys(updates).length === 0) {
				throw new ValidationError(
					"At least one valid field must be provided for update",
				);
			}

			const updatedUser = await this.userService.updateUser(
				userId,
				sanitizedUpdates,
			);
			this.sendSuccess(res, updatedUser, "User profile updated successfully");
		} catch (error) {
			console.error("Error in update user profile", error);
			this.sendError(res, mapToAppError(error));
		}
	}

	private filterAllowedFields(
		updates: any,
		allowedFields: (keyof User)[],
	): Partial<User> {
		const filtered: any = {};

		for (const field of allowedFields) {
			if (updates[field] !== undefined) {
				filtered[field] = updates[field];
			}
		}

		return filtered;
	}
}

export default UserController;
