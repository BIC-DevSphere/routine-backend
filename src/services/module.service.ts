import type { Module, PrismaClient } from "@prisma/client";
import { type BaseService, createBaseService } from "./base.service";

export type ModuleService = BaseService<Module> & {
	createOrGetModule(
		data: { code: string; name: string },
		tx: PrismaClient,
	): Promise<Module>;
};
export function createModuleService(prisma: PrismaClient): ModuleService {
	const baseService = createBaseService<Module>(prisma.module);

	return {
		...baseService,
		async createOrGetModule(
			data: { code: string; name: string },
			tx: PrismaClient,
		) {
			const moduleResult = await tx.module.upsert({
				where: { moduleCode: data.code },
				update: {},
				create: {
					name: data.name || "Unnamed Module",
					moduleCode: data.code || "NO_CODE",
				},
			});
			return moduleResult;
		},
	};
}
