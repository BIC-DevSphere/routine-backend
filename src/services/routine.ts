import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../utils/errors";

export type RoutineService = {
	getRoutineByGroup(groupId: string): Promise<WeekRoutine>;
};

type DaySlot = {
	startTime : string;
	endTime: string;
	moduleCode: string;
	moduleName: string;
	classType: string;
	room: string;
	teacher: string;
	isActive: boolean;
}

type WeekDay = {
	day : string;
	slots: DaySlot[]
}

type WeekRoutine = {
	groupId: string;
	groupName: string;
	courseName: string;
	batchName?: string | null;
	week: WeekDay[]
}


export function createRoutineService(prisma: PrismaClient): RoutineService {
	return {
		async getRoutineByGroup(groupId: string): Promise<WeekRoutine> {
			const group = await prisma.group.findUnique({
				where: {
					id: groupId
				},
				select: {
					id: true,
					name: true,
					course: {select: {name: true}},
					batch: {select:{name:true}}
				}
			})

			if (!group) throw new NotFoundError("Group");
			const routines = await prisma.routine.findMany({where: {RoutineGroup: {some: {groupId}}, isActive: true}, 
			select: {
				day:true, startTime: true, endTime: true, classType: true, isActive: true, 
				room: {select: {name: true}}, 
				module: {select: {moduleCode: true, name: true}},
				teacher: {select: {name: true}}},
				orderBy: [{day: "asc"}, {startTime: "asc"}]
			})

			const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

			const weekMap = new Map<string, DaySlot[]>();
			days.map(d => weekMap.set(d, []))

			routines.map(r => {
				const slot: DaySlot = {
					startTime: r.startTime,
					endTime: r.endTime,
					moduleCode: r.module.moduleCode,
					moduleName: r.module.name,
					classType: r.classType,
					room: r.room.name,
					teacher: r.teacher.name,
					isActive: r.isActive
				}
				weekMap.get(r.day)?.push(slot)
			})
			
			const week: WeekDay[] = days.map(day => ({
				day,
				slots: weekMap.get(day)!,
			}));
			
			return {
				groupId: group.id,
				groupName: group.name,
				courseName: group.course.name,
				batchName: group.batch?.name,
				week
			}
		},
	};
}
