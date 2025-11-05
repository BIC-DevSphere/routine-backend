import type {
	DatabaseRoutineResponse,
	RoutineResponse,
} from "../types/routine.types";

export function mapRoutineResponse(
	dbRoutine: DatabaseRoutineResponse,
): RoutineResponse {
	return {
		id: dbRoutine.id,
		roomId: dbRoutine.roomId,
		classType: dbRoutine.classType,
		moduleId: dbRoutine.moduleId,
		startTime: dbRoutine.startTime,
		endTime: dbRoutine.endTime,
		day: dbRoutine.day,
		isActive: dbRoutine.isActive,
		teacherId: dbRoutine.teacherId,
		room: {
			id: dbRoutine.room.id,
			name: dbRoutine.room.name,
			block: dbRoutine.room.block,
		},
		module: {
			id: dbRoutine.module.id,
			name: dbRoutine.module.name,
			moduleCode: dbRoutine.module.moduleCode,
			description: dbRoutine.module.description,
		},
		teacher: {
			id: dbRoutine.teacher.id,
			name: dbRoutine.teacher.name,
			email: dbRoutine.teacher.email,
			contactNumber: dbRoutine.teacher.contactNumber,
		},
		groups: dbRoutine.RoutineGroup.map((routineGroup) => ({
			id: routineGroup.id,
			groupId: routineGroup.groupId,
			routineId: routineGroup.routineId,
			group: {
				id: routineGroup.group.id,
				name: routineGroup.group.name,
				description: routineGroup.group.description,
				courseId: routineGroup.group.courseId,
				batchId: routineGroup.group.batchId,
			},
		})),
		hash: dbRoutine.hash,
	};
}

export function mapRoutineResponseArray(
	dbRoutines: DatabaseRoutineResponse[],
): RoutineResponse[] {
	return dbRoutines.map(mapRoutineResponse);
}
