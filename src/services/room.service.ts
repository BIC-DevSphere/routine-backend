import type { PrismaClient, Room } from "@prisma/client";
import { type BaseService, createBaseService } from "./base.service";

export type RoomService = BaseService<Room> & {
	createOrGetRoom(
		data: { name: string; block: string },
		tx: PrismaClient,
	): Promise<Room>;
};

export function createRoomService(prisma: PrismaClient): RoomService {
	const baseService = createBaseService<Room>(prisma.room);

	return {
		...baseService,
		async createOrGetRoom(
			data: { name: string; block: string },
			tx: PrismaClient,
		) {
			const roomResult = await tx.room.upsert({
				where: { name: data.name || "Unknown Room" },
				update: {},
				create: {
					name: data.name || "Unnamed Room",
					block: data.block || "Main Block",
				},
			});
			return roomResult;
		},
	};
}
