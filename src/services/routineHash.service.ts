import crypto from "crypto";
import { logger } from "@/lib/logger";
import type { RoutineResponse } from "@/types/routine.types";
import type { RoutineEntry } from "../types/externalApi.types";

export type RoutineHashService = {
	createRoutineHash(routine: RoutineResponse): string | null;
	createApiRoutineHash(routine: RoutineEntry): string | null;
};

export function createRoutineHashService(): RoutineHashService {
	return {
		createRoutineHash(routine: RoutineResponse): string | null {
			try {
				const data = {
					module: routine.module.moduleCode,
					day: routine.day,
					startTime: routine.startTime,
					endTime: routine.endTime,
					room: routine.room.name,
					classType: routine.classType,
					teacher: routine.teacher.name,
					groups: routine.groups.map((g) => g.group.name).sort(),
				};

				const hash = crypto
					.createHash("sha256")
					.update(JSON.stringify(data))
					.digest("hex");

				logger.debug("DB Routine Hash:", {
					hash: hash.substring(0, 8),
					module: routine.module.name,
				});
				return hash;
			} catch (error) {
				console.log("Error while hashing routine", error);
				return null;
			}
		},

		createApiRoutineHash(routine: RoutineEntry): string | null {
			try {
				const data = {
					module: routine.moduleDto.code,
					day: routine.day,
					startTime: routine.startTimeResp,
					endTime: routine.endTimeResp,
					room: routine.roomDto.name,
					classType: routine.classType,
					teacher: routine.teacherDto.name,
					groups: routine.groupList.map((g) => g.name).sort(),
				};

				const hash = crypto
					.createHash("sha256")
					.update(JSON.stringify(data))
					.digest("hex");

				logger.debug("API Routine Hash:", {
					hash: hash.substring(0, 8),
					module: routine.moduleDto.name,
				});
				return hash;
			} catch (error) {
				console.log("Error while hashing API routine", error);
				return null;
			}
		},
	};
}

export const routineHashService = createRoutineHashService();
