import type { Request, Response } from "express";
import type { RoomService } from "@/services/room.service";
import { mapToAppError } from "@/utils/errors";
import { BaseController } from "./base";

export class RoomController extends BaseController {
	constructor(private roomService: RoomService) {
		super();
	}

	async getAll(_req: Request, res: Response) {
		try {
			const rooms = await this.roomService.getAll();
			this.sendSuccess(res, rooms, "Rooms retrieved successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async getById(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				this.sendError(res, mapToAppError(new Error("Room ID is required")));
				return;
			}

			const room = await this.roomService.getById(id);

			if (!room) {
				this.sendError(res, mapToAppError(new Error("Room not found")));
				return;
			}

			this.sendSuccess(res, room, "Room retrieved successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async create(req: Request, res: Response) {
		try {
			const room = await this.roomService.create(req.body);
			this.sendSuccess(res, room, "Room created successfully", 201);
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				this.sendError(res, mapToAppError(new Error("Room ID is required")));
				return;
			}

			const room = await this.roomService.update(id, req.body);
			this.sendSuccess(res, room, "Room updated successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params;
			if (!id) {
				this.sendError(res, mapToAppError(new Error("Room ID is required")));
				return;
			}

			const room = await this.roomService.delete(id);
			this.sendSuccess(res, room, "Room deleted successfully");
		} catch (error) {
			this.sendError(res, mapToAppError(error));
		}
	}
}
