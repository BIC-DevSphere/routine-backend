import type { AppVersion, PrismaClient } from "@prisma/client";
import { type BaseService, createBaseService } from "./base.service";

export type AppVersionService = BaseService<AppVersion>;

export const createAppVersionService = (prisma: PrismaClient) => {
	const baseService = createBaseService<AppVersion>(prisma.appVersion);

	return {
		...baseService,
	};
};
