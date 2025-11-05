import type { Request, Response } from "express";
import type { GroupService } from "@/services/group.service";
import { mapToAppError } from "@/utils/errors";
import { BaseController } from "./base";

class GroupController extends BaseController {
	constructor(private groupService: GroupService) {
		super();
	}
	async getAllGroups(_req: Request, res: Response) {
		try {
			const results = await this.groupService.getAllGroups();
			if (!results?.success) {
				this.sendError(res, mapToAppError("Failed to fetch groups"));
				return;
			}
			this.sendSuccess(res, results.data, "Groups fetched successfully");
		} catch (error) {
			console.error("Error in getAllGroups:", error);
			this.sendError(res, mapToAppError(error));
		}
	}
}

export default GroupController;
