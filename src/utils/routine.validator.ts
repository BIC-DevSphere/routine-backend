import type { RoutineEntry } from "../types/externalApi.types";

export function checkRoutineValidity(data: RoutineEntry): boolean {
	try {
		if (!data) {
			console.log("Invalid: Data is null/undefined");
			return false;
		}

		// Check for null/invalid times
		if (!data.startTimeResp || !data.endTimeResp) {
			console.log(
				`Invalid: Missing start/end time for ${
					data.moduleDto?.name || "Unknown"
				}`,
			);
			return false;
		}

		// Check for null module
		if (!data.moduleDto || !data.moduleDto.name || !data.moduleDto.code) {
			console.log("Invalid: Module data is incomplete");
			return false;
		}

		// TODO: Handle case for name: "ROLE TEACHER"
		// Check for null teacher
		if (!data.teacherDto || !data.teacherDto.name) {
			console.log(`Invalid: Teacher is null for ${data.moduleDto.name}`);
			return false;
		}

		// Check for null room
		if (!data.roomDto || !data.roomDto.name) {
			console.log(`Invalid: Room is null for ${data.moduleDto.name}`);
			return false;
		}

		// Check for empty/null groups
		if (!data.groupList || data.groupList.length === 0) {
			console.log(`Invalid: No groups for ${data.moduleDto.name}`);
			return false;
		}

		// Check for null values in groups
		const hasNullGroup = data.groupList.some((g) => !g || !g.name);
		if (hasNullGroup) {
			console.log(
				`Invalid: Group list contains null values for ${data.moduleDto.name}`,
			);
			return false;
		}

		// Check for null day and classType
		if (!data.day || !data.classType) {
			console.log(
				`Invalid: Missing day or classType for ${data.moduleDto.name}`,
			);
			return false;
		}

		return true;
	} catch (error) {
		console.log("Error in checking routine validity (sync)", error);
		return false;
	}
}
