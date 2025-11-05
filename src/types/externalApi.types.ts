// Base interface for common fields
interface BaseDto {
	id: number | null;
	name: string | null;
	updatedBy: string | null;
	updatedByName: string | null;
	createdBy: string | null;
	createdByName: string | null;
	createdDate: string;
	pageSize: number | null;
	status: string;
	resourceLink: string | null;
}

export interface CourseDto extends BaseDto {
	courseType: string | null;
	courseCode: string | null;
	level: string | null;
	modules: unknown | null;
	courseIds: number[] | null;
	description?: string | null;
}

export interface ModuleDto extends BaseDto {
	moduleIds: number[] | null;
	code: string;
	teacherName: string | null;
	courseEntity: unknown | null;
	associatedRole: string | null;
}

export interface RoomDto extends BaseDto {
	roomCode: string | null;
	block: string | null;
}

export interface GroupDto extends BaseDto {
	groupId: number | null;
	groupCode: string;
	courseEntity: unknown | null;
	level: string | null;
	year: string | null;
	oldGroupCode: string | null;
	moduleEntity: unknown | null;
	courseEntityList: unknown[] | null;
}

export interface TeacherDto extends BaseDto {
	teacherId: string;
	email: string;
	contactNumber: string;
	attLogId: string | null;
	punchInDateTime: string | null;
	punchOutDateTime: string | null;
	routineId: number | null;
	deviceId: string | null;
	teacherArchivedStatus: string | null;
	moduleId: number | null;
	teacherRole: string | null;
	routineBatch: string | null;
	personalContact: string | null;
	personalEmail: string | null;
	address: string | null;
	jobType: string;
	userRegistered: boolean;
}

// TODO: Change the name RoutineEntry to something more appropriate
export interface RoutineEntry extends BaseDto {
	day: string;
	startTime: string | null;
	endTime: string | null;
	classType: string;
	year: string;
	specialization: string;
	duration: number | null;
	effectiveDate: string | null;
	batchId: number | null;
	groupDto: null;
	courseDto: CourseDto;
	moduleDto: ModuleDto;
	userDto: unknown | null;
	roomDto: RoomDto;
	courseDtoList: CourseDto[] | null;
	moduleList: ModuleDto[] | null;
	groupList: GroupDto[];
	groups: GroupDto[] | null;
	courseId: number | null;
	routineDate: string | null;
	startTimeResp: string;
	endTimeResp: string;
	teacherDto: TeacherDto;
	previousRoutineId: number | null;
	dateOf: string | null;
	block: string;
	course: string | null;
	intake: string | null;
	routineBatch: string | null;
	startDate: string | null;
	endDate: string | null;
	teacherId: number | null;
	moduleId: number | null;
	faculty: string | null;
	temporaryRoutineStatus: boolean;
	temporaryRoutineId: number | null;
	temporaryRoutineStartDate: string | null;
	temporaryRoutineEndDate: string | null;
	remarks: string | null;
	approval: string | null;
	routineType: string | null;
	archivedStatus: string | null;
	isReplacedBy: number | null;
	updatedReason: string | null;
	classCancelStatus: boolean;
	routineCreateStatus: string | null;
	groupMergeRoutine: unknown | null;
	routineIdListForMerge: number[] | null;
	temporaryRoutineStartDateValidation: string | null;
	temporaryRoutineEndDateValidation: string | null;
	presentPercentage: string;
	updateStatus: string | null;
	alevelGroupList: GroupDto[] | null;
	temporaryRoutineEffectiveDate: string | null;
}

export interface ExternalApiResponse {
	list: RoutineEntry[];
}
