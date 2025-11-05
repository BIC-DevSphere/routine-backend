import type { Request, Response } from "express";
import type { TeacherService } from "@/services/teacher.service";
import { mapToAppError } from "@/utils/errors";
import { BaseController } from "./base";

export class TeacherController extends BaseController {
	constructor(private teacherService: TeacherService) {
		super();
	}

	async getAll(_req: Request, res: Response) {
		try {
			const teachers = await this.teacherService.getAll();
			this.sendSuccess(res, teachers, "Teachers retrieved successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				this.sendError(res, mapToAppError(new Error("Teacher ID is required")));
				return;
			}

			const teacher = await this.teacherService.getById(id);

			if (!teacher) {
				this.sendError(res, mapToAppError(new Error("Teacher not found")));
				return;
			}

			this.sendSuccess(res, teacher, "Teacher retrieved successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async create(req: Request, res: Response) {
		try {
			const teacher = await this.teacherService.create(req.body);
			this.sendSuccess(res, teacher, "Teacher created successfully", 201);
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				this.sendError(res, mapToAppError(new Error("Teacher ID is required")));
				return;
			}

			const teacher = await this.teacherService.update(id, req.body);
			this.sendSuccess(res, teacher, "Teacher updated successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				this.sendError(res, mapToAppError(new Error("Teacher ID is required")));
				return;
			}

			const teacher = await this.teacherService.delete(id);
			this.sendSuccess(res, teacher, "Teacher deleted successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async getByEmail(req: Request, res: Response) {
		try {
			const { email } = req.params;
			if (!email) {
				this.sendError(res, mapToAppError(new Error("Email is required")));
				return;
			}

			const teacher = await this.teacherService.getTeacherByEmail(email);

			if (!teacher) {
				this.sendError(res, mapToAppError(new Error("Teacher not found")));
				return;
			}

			this.sendSuccess(res, teacher, "Teacher retrieved successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}
}
