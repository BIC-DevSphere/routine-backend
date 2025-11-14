import type { Group, PrismaClient } from "@prisma/client";
import { type BaseService, createBaseService } from "./base.service";

export type GroupService = BaseService<Group>;

export function createGroupService(prisma: PrismaClient): GroupService {
	const baseService = createBaseService<Group>(prisma.group);

	return {
		...baseService,
	};
}
