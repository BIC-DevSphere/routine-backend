import type { PrismaClient, RoutineGroup } from "@prisma/client";
import { NotFoundError } from "../utils/errors";

export type RoutineService = {
	getRoutineByGroup(groupId: string): Promise<RoutineGroup[]>;
};

export function createRoutineService(prisma: PrismaClient): RoutineService {
	return {
		async getRoutineByGroup(groupId: string) {
			const routines = await prisma.routineGroup.findMany({
				where: {
					groupId,
				},
				include: {
					routine: true,
				},
			});

			if (routines.length === 0) {
				throw new NotFoundError(`Routines for group ID: ${groupId}`);
			}

			return routines;
		},
	};
}
