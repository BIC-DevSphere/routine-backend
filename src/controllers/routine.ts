import type { Request, Response } from "express";
import type { RoutineService } from "@/services/routine";
import { mapToAppError, ValidationError } from "@/utils/errors";
import { BaseController } from "./base";

class RoutineController extends BaseController {
	constructor(private routineService: RoutineService) {
		super();
	}

	getAllRoutineByGroup = async (req: Request, res: Response) => {
		try {
			const { groupId } = req.params;
			if (!groupId) {
				throw new ValidationError("Group ID is required");
			}
			const routines = await this.routineService.getRoutineByGroup(groupId);
			this.sendSuccess(res, routines, "Routines fetched successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	};
}

export default RoutineController;
