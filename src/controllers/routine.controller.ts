import type { Request, Response } from "express";
import type { RoutineService } from "@/services/routine.service";
import type { RoutineSyncService } from "@/services/routineSync.service";
import type { RoutineEntry } from "@/types/externalApi.types";
import { mapToAppError, NotFoundError, ValidationError } from "@/utils/errors";
import { BaseController } from "./base";

class RoutineController extends BaseController {
	constructor(
		private routineService: RoutineService,
		private routineSyncService: RoutineSyncService,
	) {
		super();
	}

	async getAllRoutinesByGroup(req: Request, res: Response) {
		try {
			const groupId = req.groupId;
			if (!groupId) {
				throw new ValidationError("Group ID is required");
			}
			const routines = await this.routineService.getRoutineByGroup(groupId);
			this.sendSuccess(res, routines, "Routines fetched successfully");
		} catch (error) {
			console.error("Error in getAllRoutinesByGroup:", error);
			this.sendError(res, mapToAppError(error));
		}
	}

	async getAllRoutinesByAdmin(req: Request, res: Response) {
		try {
			console.log("Admin fetching routines by group");
			const groupdId = req.query.groupId as string;
			if (!groupdId) {
				throw new ValidationError("Group ID is required");
			}
			const routines = await this.routineService.getRoutineByGroup(groupdId);
			this.sendSuccess(res, routines, "Routines fetched successfully");
		} catch (error) {
			console.error("Error in getAllRoutinesByAdmin:", error);
			this.sendError(res, mapToAppError(error));
		}
	}

	async addRoutine(req: Request, res: Response) {
		try {
			const routineData = req.body;

			if (!routineData) {
				throw new ValidationError("Routine data is required");
			}
			const result = await this.routineService.addRoutineEntryToDb(routineData);
			if (!result?.success) {
				this.sendError(res, mapToAppError("Failed to add routine"));
				return;
			}
			this.sendSuccess(res, result, "Routine added successfully");
		} catch (error) {
			console.error("Error in addRoutine:", error);
			this.sendError(res, mapToAppError(error));
		}
	}

	async fetchWeekRoutines(req: Request, res: Response) {
		try {
			const { startDate } = req.body;
			if (!startDate) {
				throw new ValidationError("Start date is required");
			}

			// TODO: Handle comparision logic before deactivating existing routines
			let existingRoutines = 0;

			// Handle NotFoundError gracefully when no routines exist
			try {
				existingRoutines = await this.routineService.getRoutinesCount();
			} catch (error) {
				if (error instanceof NotFoundError) {
					existingRoutines = 0;
				} else {
					throw error;
				}
			}

			if (existingRoutines > 0) {
				const updateExisingRoutines =
					await this.routineSyncService.deactivateAllRoutines();
				if (!updateExisingRoutines.success) {
					this.sendError(
						res,
						mapToAppError("Failed to deactivate existing routines"),
					);
					return;
				}
			}

			const routines =
				await this.routineService.fetchAndPopulateWeekRoutines(startDate);

			if (!routines.success) {
				this.sendError(res, mapToAppError("Failed to fetch week routines"));
				return;
			}
			this.sendSuccess(res, routines, "Week routines fetched successfully");
		} catch (error) {
			console.error("Error in fetchWeekRoutines:", error);
			this.sendError(res, mapToAppError(error));
		}
	}

	async fetchRoutineByDate(req: Request, res: Response) {
		try {
			const { date } = req.query;

			if (!date || typeof date !== "string") {
				throw new ValidationError("Date query parameter is required");
			}
			const result = await this.routineService.fetchRoutineByDate(date);
			if (!result) {
				this.sendError(res, mapToAppError("No routines found for the date"));
				return;
			}

			const filteredResults = result.list.filter(
				(routine: RoutineEntry) =>
					routine.courseDto !== null &&
					routine.groupList !== null &&
					routine.teacherDto !== null &&
					routine.moduleDto !== null &&
					routine.roomDto !== null,
			);

			// TODO: Handle results properly
			const results: any[] = [];
			console.log("Filtered results count (length):", filteredResults.length);
			for (const routine of filteredResults) {
				try {
					const addToDbResult =
						await this.routineService.addRoutineEntryToDb(routine);
					results.push(addToDbResult);
				} catch (error) {
					console.error("Error adding routine:", error);
				}
			}

			if (results.length === 0) {
				this.sendError(
					res,
					mapToAppError("No routines were added to the database"),
				);
				return;
			}
			this.sendSuccess(res, result, "Routine route fetched successfully");
		} catch (error) {
			console.error("Error in routine route:", error);
			this.sendError(res, mapToAppError(error));
		}
	}

	// async syncRoutineByDate(req: Request, res: Response) {
	// 	try {
	// 		const { date } = req.query;

	// 		if (!date || typeof date !== "string") {
	// 			// res.status(300).json({ message: "Date query parameter is required" });
	// 			throw new ValidationError("Date query parameter is required");
	// 		}

	// 		const result = await this.routineSyncService.syncDailyRoutine(date);
	// 		if (!result.success) {
	// 			this.sendError(res, mapToAppError(result || "Sync failed"));
	// 			return;
	// 		}

	// 		this.sendSuccess(res, result, "Routines synced successfully");
	// 	} catch (error) {
	// 		console.error("Error syncing routines:", error);
	// 		this.sendError(res, mapToAppError(error));
	// 	}
	// }

	async syncWeeklyRoutines(req: Request, res: Response) {
		try {
			const { startDate } = req.body;

			if (!startDate || typeof startDate !== "string") {
				throw new ValidationError("Start date is required");
			}

			const result = await this.routineSyncService.syncWeeklyRoutine(startDate);

			if (!result.success) {
				this.sendError(res, mapToAppError("Weekly sync failed"));
				return;
			}

			this.sendSuccess(res, result, "Weekly routines synced successfully");
		} catch (error) {
			console.error("Error syncing weekly routines:", error);
			this.sendError(res, mapToAppError(error));
		}
	}
}

export default RoutineController;
