import prisma from "@/db";
import type { DaySlot, WeekDay, WeekRoutine } from "@/types/routine.types";
import {
	DatabaseError,
	ExternalServiceError,
	mapToAppError,
	NotFoundError,
} from "@/utils/errors";
import { mapRoutineResponseArray } from "@/utils/routine.mapper";
import { checkRoutineValidity } from "@/utils/routine.validator";
import type { RoutineEntry } from "../types/externalApi.types";
import { routineHashService } from "./routineHash.service";
import { routineIntegrationServices } from "./routineIntegration.service";

export class RoutineService {
	async addRoutineEntryToDb(data: RoutineEntry) {
		try {
			const isValid = checkRoutineValidity(data);
			if (!isValid) {
				// return { success: false, error: "Invalid routine data" };
				throw new ExternalServiceError(
					"Routine Integration",
					"Invalid routine data",
				);
			}

			const result = await prisma.$transaction(async (tx) => {
				const courseResult = await tx.course.upsert({
					where: { name: data.courseDto.name || "Unknown Course" },
					update: {}, // fields to update if found
					create: {
						name: data.courseDto.name || "Unknown Course",
						description: data.courseDto.description || "",
					},
				});
				if (!courseResult) {
					throw new DatabaseError("Could not add new course");
				}

				const moduleResult = await tx.module.upsert({
					where: { moduleCode: data.moduleDto.code },
					update: {},
					create: {
						name: data.moduleDto.name || "Unnamed Module",
						moduleCode: data.moduleDto.code || "NO_CODE",
					},
				});

				if (!moduleResult) {
					throw new DatabaseError("Could not add new module");
				}

				const roomResult = await tx.room.upsert({
					where: { name: data.roomDto.name || "Unknown Room" },
					update: {},
					create: {
						name: data.roomDto.name || "Unnamed Room",
						block: data.roomDto.block || "Main Block",
					},
				});

				if (!roomResult) {
					return { success: false, error: "Could not add new module" };
				}

				// const teacherResult = await tx.teacher.upsert({
				//     where:{email: data.teacherDto.}
				// })
				const teacherQuery = await tx.teacher.findFirst({
					where: { name: data.teacherDto.name || "Unknown Teacher" },
				});

				let teacherId: string | undefined = teacherQuery?.id;

				if (!teacherQuery) {
					const addTeacher = await tx.teacher.create({
						data: {
							name: data.teacherDto.name || "Unnamed Teacher",
							email: data.teacherDto.email || "",
							contactNumber: data.teacherDto.contactNumber || "",
						},
					});

					if (!addTeacher) {
						throw new DatabaseError("Could not add new teacher");
					}
					teacherId = addTeacher.id;
				}

				if (!teacherId) {
					throw new DatabaseError("Teacher ID not found");
				}

				const isValid = checkRoutineValidity(data);
				if (!isValid) {
					return null;
				}

				const hash = routineHashService.createApiRoutineHash(data);
				if (!hash) {
					throw new ExternalServiceError(
						"Routine Hash Service",
						"Could not create routine hash",
					);
				}

				const routineResult = await tx.routine.create({
					data: {
						classType: data.classType,
						day: data.day,
						startTime: data.startTimeResp,
						endTime: data.endTimeResp,
						moduleId: moduleResult.id,
						teacherId: teacherId,
						roomId: roomResult.id,
						hash: hash,
					},
				});

				const groupResults = [];
				// TODO: Implement promise all later
				for (const group of data.groupList) {
					const groupResult = await tx.group.upsert({
						where: { name: group.name || "Unknown Group" },
						update: {},
						create: {
							name: group.name || "Unknown Group",
							courseId: courseResult.id,
						},
					});

					const groupRoutineResult = await tx.routineGroup.create({
						data: {
							groupId: groupResult.id,
							routineId: routineResult.id,
						},
					});
					groupResults.push({
						group: groupResult,
						routineGroup: groupRoutineResult,
					});
				}

				return {
					success: true,
					routine: routineResult,
					groups: groupResults,
				};
			});
			if (!result) {
				// return { success: false, error: "Transaction failed" };
				throw new DatabaseError("Transaction failed");
			}
			return result;
		} catch (error) {
			console.log("Error while adding entry", error);
			throw mapToAppError(error);
		}
	}

	async getAllRoutines(day?: string) {
		try {
			const result = await prisma.routine.findMany({
				include: {
					room: true,
					module: true,
					teacher: true,
					RoutineGroup: {
						include: {
							group: true,
						},
					},
				},
				where: { day: day },
			});
			if (!result || result.length === 0) {
				// return { success: false, error: "Could not fetch routines" };
				throw new NotFoundError("Routines");
			}
			return mapRoutineResponseArray(result);
		} catch (error) {
			console.log("Error in fetching routines", error);
			throw mapToAppError(error);
		}
	}

	async getRoutinesCount() {
		try {
			const count = await prisma.routine.count({
				where: {
					isActive: true,
				},
			});
			console.log("Fetched routines count:", count);
			if (!count) {
				// return { success: false, error: "No active routines found" };
				throw new NotFoundError("Active Routines");
			}
			return count;
		} catch (error) {
			console.error("Error fetching routines count:", error);
			throw mapToAppError(error);
		}
	}

	async getRoutineByGroup(groupId: string): Promise<WeekRoutine> {
		try {
			const group = await prisma.group.findUnique({
				where: {
					id: groupId,
				},
				select: {
					id: true,
					name: true,
					course: { select: { name: true } },
					batch: { select: { name: true } },
				},
			});

			if (!group) throw new NotFoundError("Group");
			const routines = await prisma.routine.findMany({
				where: { RoutineGroup: { some: { groupId } }, isActive: true },
				select: {
					day: true,
					startTime: true,
					endTime: true,
					classType: true,
					isActive: true,
					room: { select: { name: true } },
					module: { select: { moduleCode: true, name: true } },
					teacher: { select: { name: true } },
				},
				orderBy: [{ day: "asc" }, { startTime: "asc" }],
			});

			const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

			const weekMap = new Map<string, DaySlot[]>();
			days.map((d) => weekMap.set(d, []));

			routines.forEach((r) => {
				const slot: DaySlot = {
					startTime: r.startTime,
					endTime: r.endTime,
					moduleCode: r.module.moduleCode,
					moduleName: r.module.name,
					classType: r.classType,
					room: r.room.name,
					teacher: r.teacher.name,
					isActive: r.isActive,
				};
				weekMap.get(r.day)?.push(slot);
			});

			const week: WeekDay[] = days.map((day) => ({
				day,
				slots: weekMap.get(day)!,
			}));

			return {
				groupId: group.id,
				groupName: group.name,
				courseName: group.course.name,
				batchName: group.batch?.name,
				week,
			};
		} catch (error) {
			console.error("Error fetching routine by group:", error);
			throw mapToAppError(error);
		}
	}

	async getRoutinesByDay(day: string) {
		try {
			const result = await prisma.routine.findMany({
				include: {
					room: true,
					module: true,
					teacher: true,
					RoutineGroup: {
						include: {
							group: true,
						},
					},
				},
				where: {
					day: day,
					isActive: true,
				},
			});

			if (!result || result.length === 0) {
				throw new NotFoundError("Routines");
			}
			return mapRoutineResponseArray(result);
		} catch (error) {
			console.error("Error fetching routines by day:", error);
			throw mapToAppError(error);
		}
	}

	async fetchAndPopulateWeekRoutines(startDate: string, token: string) {
		try {
			console.log("Fetching week routines starting from:", startDate);
			const result = await routineIntegrationServices.getRoutinesofDate(
				token,
				"2025-11-10T00:00:00Z",
			);

			console.log("Initial fetch result:", result);
			const weekDates = this.generateWeekDates(startDate);
			console.log("Generated week dates:", weekDates);

			for (const date of weekDates) {
				const routinesOfDate =
					await routineIntegrationServices.getRoutinesofDate(token, date);
				if (!routinesOfDate) continue;

				for (const routine of routinesOfDate.list) {
					try {
						const isValid = checkRoutineValidity(routine);
						if (!isValid) {
							console.log("Invalid routine data, skipping:", routine);
							continue;
						}
						const dbResult = await this.addRoutineEntryToDb(routine);
						console.log("Database insertion result:", dbResult);
					} catch (error) {
						console.error("Error processing routine:", routine, error);
					}
				}
			}

			return { success: true };
		} catch (error) {
			console.error("Error fetching week routines:", error);
			throw mapToAppError(error);
		}
	}

	private generateWeekDates(startDate: string): string[] {
		const dates: string[] = [];
		const start = new Date(startDate);

		for (let i = 0; i < 7; i++) {
			const currentDate = new Date(start);
			currentDate.setDate(start.getDate() + i);

			// Format to ISO string (e.g., "2025-11-10T00:00:00Z")
			dates.push(currentDate.toISOString());
		}

		return dates;
	}
}

export const routineService = new RoutineService();
