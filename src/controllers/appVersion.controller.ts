import type { Request, Response } from "express";
import type { AppVersionService } from "@/services/appVersion.service";
import { mapToAppError, ValidationError } from "@/utils/errors";
import { BaseController } from "./base";

class AppVersionController extends BaseController {
	constructor(private appVersionService: AppVersionService) {
		super();
	}

	async getAll(_req: Request, res: Response) {
		try {
			const appVersions = await this.appVersionService.getAll();
			this.sendSuccess(res, appVersions, "App versions retrieved successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				throw new ValidationError("App version ID is required");
			}

			const appVersion = await this.appVersionService.getById(id);

			if (!appVersion) {
				throw new ValidationError("App version not found");
			}

			this.sendSuccess(res, appVersion, "App version retrieved successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async create(req: Request, res: Response) {
		try {
			const appVersion = await this.appVersionService.create(req.body);
			this.sendSuccess(
				res,
				appVersion,
				"App version created successfully",
				201,
			);
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				throw new ValidationError("App version ID is required");
			}

			const appVersion = await this.appVersionService.update(id, req.body);
			this.sendSuccess(res, appVersion, "App version updated successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				throw new ValidationError("App version ID is required");
			}

			const appVersion = await this.appVersionService.delete(id);
			this.sendSuccess(res, appVersion, "App version deleted successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}
}

export default AppVersionController;
