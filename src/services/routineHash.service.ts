import crypto from "crypto";
import type { RoutineResponse } from "@/types/routine.types";
import type { RoutineEntry } from "../types/externalApi.types";

export class RoutineHashService {
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

			console.log(
				`DB Hash: ${hash.substring(0, 8)}... for ${routine.module.name}`,
			);
			return hash;
		} catch (error) {
			console.log("Error while hashing routine", error);
			return null;
		}
	}

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

			console.log(
				`API Hash: ${hash.substring(0, 8)}... for ${routine.moduleDto.name}`,
			);
			return hash;
		} catch (error) {
			console.log("Error while hashing API routine", error);
			return null;
		}
	}
}

export const routineHashService = new RoutineHashService();
