import type { Request, Response } from "express";
import type { GroupService } from "@/services/group.service";
import { mapToAppError } from "@/utils/errors";
import { BaseController } from "./base";

class GroupController extends BaseController {
	constructor(private groupService: GroupService) {
		super();
	}

	async getAll(_req: Request, res: Response) {
		try {
			const groups = await this.groupService.getAll();
			this.sendSuccess(res, groups, "Groups retrieved successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				this.sendError(res, mapToAppError(new Error("Group ID is required")));
				return;
			}

			const group = await this.groupService.getById(id);

			if (!group) {
				this.sendError(res, mapToAppError(new Error("Group not found")));
				return;
			}

			this.sendSuccess(res, group, "Group retrieved successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async create(req: Request, res: Response) {
		try {
			const group = await this.groupService.create(req.body);
			this.sendSuccess(res, group, "Group created successfully", 201);
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				this.sendError(res, mapToAppError(new Error("Group ID is required")));
				return;
			}

			const group = await this.groupService.update(id, req.body);
			this.sendSuccess(res, group, "Group updated successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				this.sendError(res, mapToAppError(new Error("Group ID is required")));
				return;
			}

			const group = await this.groupService.delete(id);
			this.sendSuccess(res, group, "Group deleted successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}
}

export default GroupController;
