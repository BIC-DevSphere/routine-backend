import type { Request, Response } from "express";
import type { ModuleService } from "@/services/module.service";
import { mapToAppError, ValidationError } from "@/utils/errors";
import { BaseController } from "./base";

export class ModuleController extends BaseController {
	constructor(private moduleService: ModuleService) {
		super();
	}

	async getAll(_req: Request, res: Response) {
		try {
			const modules = await this.moduleService.getAll();
			this.sendSuccess(res, modules, "Modules retrieved successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				throw new ValidationError("Module ID is required");
			}

			const module = await this.moduleService.getById(id);

			if (!module) {
				throw new ValidationError("Module not found");
			}

			this.sendSuccess(res, module, "Module retrieved successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async create(req: Request, res: Response) {
		try {
			const module = await this.moduleService.create(req.body);
			this.sendSuccess(res, module, "Module created successfully", 201);
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				throw new ValidationError("Module ID is required");
			}

			const module = await this.moduleService.update(id, req.body);
			this.sendSuccess(res, module, "Module updated successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				throw new ValidationError("Module ID is required");
			}

			const module = await this.moduleService.delete(id);
			this.sendSuccess(res, module, "Module deleted successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}
}
