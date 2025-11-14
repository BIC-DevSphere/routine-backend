import type { Module, PrismaClient } from "@prisma/client";
import { type BaseService, createBaseService } from "./base.service";

export type ModuleService = BaseService<Module>;
export function createModuleService(prisma: PrismaClient): ModuleService {
	const baseService = createBaseService<Module>(prisma.module);

	return {
		...baseService,
	};
}
