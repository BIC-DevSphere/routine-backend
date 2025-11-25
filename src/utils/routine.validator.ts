import { logger } from "@/lib/logger";
import type { RoutineEntry } from "../types/externalApi.types";

export function checkRoutineValidity(data: RoutineEntry): boolean {
	try {
		if (!data) {
			logger.debug("Routine validity check", {
				reason: "Data is null/undefined",
				module: "Unknown",
			});
			return false;
		}

		// Check for null/invalid times
		if (!data.startTimeResp || !data.endTimeResp) {
			logger.debug("Routine validity check", {
				reason: "Missing start/end time",
				module: data.moduleDto?.name || "Unknown",
			});
			return false;
		}

		// Check for null module
		if (!data.moduleDto || !data.moduleDto.name || !data.moduleDto.code) {
			logger.debug("Routine validity check", {
				reason: "Incomplete module data",
				module: data.moduleDto?.name || "Unknown",
			});
			return false;
		}

		// TODO: Handle case for name: "ROLE TEACHER"
		// Check for null teacher
		if (
			!data.teacherDto ||
			data.teacherDto.name === null ||
			!data.teacherDto.name
		) {
			logger.debug("Routine validity check", {
				reason: "Missing teacher data",
				module: data.moduleDto?.name || "Unknown",
			});
			return false;
		}

		// Check for null room
		if (!data.roomDto || !data.roomDto.name) {
			logger.debug("Routine validity check", {
				reason: "Missing room data",
				module: data.moduleDto?.name || "Unknown",
			});
			return false;
		}

		// Check for empty/null groups
		if (!data.groupList || data.groupList.length === 0) {
			logger.debug("Routine validity check", {
				reason: "No groups assigned",
				module: data.moduleDto?.name || "Unknown",
			});
			return false;
		}

		// Check for null values in groups
		const hasNullGroup = data.groupList.some((g) => !g || !g.name);
		if (hasNullGroup) {
			logger.debug("Routine validity check", {
				reason: "Null values in group list",
				module: data.moduleDto?.name || "Unknown",
			});
			return false;
		}

		// Check for null day and classType
		if (!data.day || !data.classType) {
			logger.debug("Routine validity check", {
				reason: "Missing day or classType",
				module: data.moduleDto?.name || "Unknown",
			});
			return false;
		}

		return true;
	} catch (error) {
		logger.error("Error in checking routine validity (sync)", { error });
		return false;
	}
}
