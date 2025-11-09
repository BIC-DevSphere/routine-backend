export interface RoutineResponse {
	id: string;
	roomId: string;
	classType: string;
	moduleId: string;
	startTime: string;
	endTime: string;
	day: string;
	isActive: boolean;
	teacherId: string;
	hash: string;
	room: {
		id: string;
		name: string;
		block: string;
	};
	module: {
		id: string;
		name: string;
		moduleCode: string;
		description: string | null;
	};
	teacher: {
		id: string;
		name: string;
		email: string;
		contactNumber: string;
	};
	groups: {
		id: string;
		groupId: string;
		routineId: string;
		group: {
			id: string;
			name: string;
			description: string | null;
			courseId: string;
			batchId: string | null;
		};
	}[];
}

export interface DatabaseRoutineResponse {
	id: string;
	roomId: string;
	classType: string;
	moduleId: string;
	startTime: string;
	endTime: string;
	day: string;
	isActive: boolean;
	teacherId: string;
	room: {
		id: string;
		name: string;
		block: string;
	};
	module: {
		id: string;
		name: string;
		moduleCode: string;
		description: string | null;
	};
	teacher: {
		id: string;
		name: string;
		email: string;
		contactNumber: string;
	};
	hash: string;
	RoutineGroup: {
		id: string;
		groupId: string;
		routineId: string;
		group: {
			id: string;
			name: string;
			description: string | null;
			courseId: string;
			batchId: string | null;
		};
	}[];
}

export interface DaySlot {
	startTime: string;
	endTime: string;
	moduleCode: string;
	moduleName: string;
	classType: string;
	room: string;
	teacher: string;
	isActive: boolean;
	isJoinedClass: boolean;
	joinedGroups?: string[];
}

export interface WeekDay {
	day: string;
	slots: DaySlot[];
}

export interface WeekRoutine {
	groupId: string;
	groupName: string;
	courseName: string;
	batchName?: string | null;
	week: WeekDay[];
}
