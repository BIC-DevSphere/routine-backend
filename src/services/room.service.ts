import type { PrismaClient, Room } from "@prisma/client";
import { mapToAppError } from "@/utils/errors";
import { type BaseService, createBaseService } from "./base.service";

export type RoomService = BaseService<Room>;

export function createRoomService(prisma: PrismaClient): RoomService {
	const baseService = createBaseService<Room>(prisma.room);

	return {
		...baseService,
	};
}
