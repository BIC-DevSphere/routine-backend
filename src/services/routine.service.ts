import type { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/logger";
import type {
	DaySlot,
	RoutineResponse,
	WeekDay,
	WeekRoutine,
} from "@/types/routine.types";
import { generateWeekDates } from "@/utils/date";
import {
	DatabaseError,
	ExternalServiceError,
	mapToAppError,
	NotFoundError,
} from "@/utils/errors";
import { mapRoutineResponseArray } from "@/utils/routine.mapper";
import { checkRoutineValidity } from "@/utils/routine.validator";
import type {
	ExternalApiResponse,
	RoutineEntry,
} from "../types/externalApi.types";
import type { ModuleService } from "./module.service";
import type { RoomService } from "./room.service";
import { routineHashService } from "./routineHash.service";
import { routineIntegrationServices } from "./routineIntegration.service";
import type { TeacherService } from "./teacher.service";

export type RoutineService = {
	addRoutineEntryToDb(data: RoutineEntry): Promise<{
		success: boolean;
		existing?: boolean;
		routine?: any;
		groups?: any;
	}>;
	getAllRoutines(day?: string): Promise<RoutineResponse[]>;
	getRoutinesCount(): Promise<number>;
	getRoutineByGroup(groupId: string): Promise<WeekRoutine>;
	getRoutinesByDay(day: string): Promise<RoutineResponse[]>;
	fetchAndPopulateWeekRoutines(startDate: string): Promise<{
		success: boolean;
		duration: string;
		stats: {
			total: number;
			successful: number;
			skipped: number;
			failed: number;
		};
		dates: number;
	}>;
	fetchRoutineByDate(date: string): Promise<ExternalApiResponse | undefined>;
};

export function createRoutineService(
	prisma: PrismaClient,
	teacherService: TeacherService,
	roomService: RoomService,
	moduleService: ModuleService,
): RoutineService {
	const createOrGetCourse = async (
		tx: PrismaClient,
		courseName: string,
		description: string,
	) => {
		const courseResult = await tx.course.upsert({
			where: { name: courseName || "Unknown Course" },
			update: {},
			create: {
				name: courseName || "Unknown Course",
				description: description || "",
			},
		});
		return courseResult;
	};
	return {
		async addRoutineEntryToDb(data: RoutineEntry) {
			try {
				const isValid = checkRoutineValidity(data);
				if (!isValid) {
					throw new ExternalServiceError(
						"Routine Integration",
						"Invalid routine data",
					);
				}

				const hash = routineHashService.createApiRoutineHash(data);
				if (!hash) {
					throw new ExternalServiceError(
						"Routine Hash Service",
						"Could not create routine hash",
					);
				}

				const existingRoutine = await prisma.routine.findUnique({
					where: { hash },
				});

				if (existingRoutine) {
					// console.log(`[Skip] Routine already exists: ${hash}`);
					if (!existingRoutine.isActive) {
						await prisma.routine.update({
							where: { id: existingRoutine.id },
							data: { isActive: true },
						});
						logger.info("Reactivated existing routine", {
							hash: hash.substring(0, 8),
							id: existingRoutine.id,
						});
					}
					logger.info("Routine already exists", { hash: hash.substring(0, 8) });
					return { success: true, existing: true, routine: existingRoutine };
				}

				const result = await prisma.$transaction(async (tx) => {
					const [courseResult, moduleResult, roomResult, teacherResult] =
						await Promise.all([
							createOrGetCourse(
								tx,
								data.courseDto.name,
								data.courseDto.description,
							).catch((err) => {
								console.error("[Course Error]: ", err);
								throw err;
							}),
							moduleService
								.createOrGetModule(
									{
										code: data.moduleDto.code,
										name: data.moduleDto.name || "Unnamed Module",
									},
									tx,
								)
								.catch((err) => {
									logger.error("Module creation error", {
										error: err instanceof Error ? err.message : err,
									});
									throw err;
								}),
							roomService
								.createOrGetRoom(
									{
										name: data.roomDto.name || "Unknown Room",
										block: data.roomDto.block || "Main Block",
									},
									tx,
								)
								.catch((err) => {
									logger.error("Room creation error", {
										error: err instanceof Error ? err.message : err,
									});
									throw err;
								}),
							teacherService
								.createOrGetTeacher(
									{
										name: data.teacherDto.name || "Unknown Teacher",
										email: data.teacherDto.email,
										contactNumber:
											data.teacherDto.contactNumber || "9999999999",
									},
									tx,
								)
								.catch((err) => {
									logger.error("Teacher creation error", {
										error: err instanceof Error ? err.message : err,
									});
									throw err;
								}),
						]);

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
							teacherId: teacherResult.id,
							roomId: roomResult.id,
							hash: hash,
						},
					});

					// const groupResults = [];

					// // TODO: Implement promise all later
					// for (const group of data.groupList) {
					// 	const groupResult = await tx.group.upsert({
					// 		where: { name: group.name || "Unknown Group" },
					// 		update: {},
					// 		create: {
					// 			name: group.name || "Unknown Group",
					// 			courseId: courseResult.id,
					// 		},
					// 	});

					// 	const groupRoutineResult = await tx.routineGroup.create({
					// 		data: {
					// 			groupId: groupResult.id,
					// 			routineId: routineResult.id,
					// 		},
					// 	});
					// 	groupResults.push({
					// 		group: groupResult,
					// 		routineGroup: groupRoutineResult,
					// 	});
					// }
					const groupResults = await Promise.all(
						data.groupList.map(async (group) => {
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

							return {
								group: groupResult,
								routineGroup: groupRoutineResult,
							};
						}),
					);

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
				logger.error("Error in adding routine entry to DB", {
					error: error instanceof Error ? error.message : error,
				});
				throw mapToAppError(error);
			}
		},

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
				logger.error("Error fetching all routines", {
					error: error instanceof Error ? error.message : error,
				});
				throw mapToAppError(error);
			}
		},

		async getRoutinesCount() {
			try {
				const count = await prisma.routine.count({
					where: {
						isActive: true,
					},
				});
				logger.debug("Fetched routines count:", { count });
				if (!count) {
					// return { success: false, error: "No active routines found" };
					throw new NotFoundError("Active Routines");
				}
				return count;
			} catch (error) {
				logger.error("Error fetching routines count", {
					error: error instanceof Error ? error.message : error,
				});
				throw mapToAppError(error);
			}
		},

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
						teacher: { select: { name: true, email: true } },
						RoutineGroup: {
							select: {
								group: {
									select: {
										id: true,
										name: true,
									},
								},
							},
						},
					},
					orderBy: [{ day: "asc" }, { startTime: "asc" }],
				});

				const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

				const weekMap = new Map<string, DaySlot[]>();
				days.map((d) => weekMap.set(d, []));

				routines.forEach((r) => {
					const isJoinedClass = r.RoutineGroup.length > 1;
					const joinedGroups = r.RoutineGroup.map((rg) => rg.group.name);

					const slot: DaySlot = {
						startTime: r.startTime,
						endTime: r.endTime,
						moduleCode: r.module.moduleCode,
						moduleName: r.module.name,
						classType: r.classType,
						room: r.room.name,
						teacher: r.teacher,
						isActive: r.isActive,
						isJoinedClass,
						joinedGroups,
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
				logger.error("Error fetching routine by group", {
					error: error instanceof Error ? error.message : error,
				});
				throw mapToAppError(error);
			}
		},

		async getRoutinesByDay(day: string): Promise<RoutineResponse[]> {
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
				logger.error("Error fetching routines by day", {
					error: error instanceof Error ? error.message : error,
				});
				throw mapToAppError(error);
			}
		},

		async fetchAndPopulateWeekRoutines(startDate: string) {
			const batchStartTime = Date.now();
			let successCount = 0;
			let skipCount = 0;
			let errorCount = 0;
			const errors: Array<{ routine: string; error: string }> = [];
			const failedEntries: Array<{ routine: string; error: string }> = []; // Track failed entries

			try {
				const token = await routineIntegrationServices.getAuthToken();
				if (!token) {
					throw new ExternalServiceError(
						"Routine Integration",
						"Failed to obtain auth token",
					);
				}
				logger.debug("Obtained auth token:");

				const weekDates = generateWeekDates(startDate);
				logger.debug("Generated week dates:", weekDates);

				for (const date of weekDates) {
					const routinesOfDate =
						await routineIntegrationServices.getRoutinesofDate(token, date);
					if (!routinesOfDate) continue;

					for (const routine of routinesOfDate.list) {
						const routineDesc = `${routine.day}-${routine.moduleDto?.name || "Unknown"}- ${routine.teacherDto?.name || "Unknown Teacher"} - ${routine.startTimeResp} to ${routine.endTimeResp}`;

						try {
							const isValid = checkRoutineValidity(routine);
							if (!isValid) {
								logger.debug("Skipping invalid routine", {
									routine: routineDesc,
								});
								skipCount++;
								continue;
							}
							const dbResult = await this.addRoutineEntryToDb(routine);
							if (dbResult.existing) {
								skipCount++;
								continue;
							}

							successCount++;
							// console.log("Database insertion result:", dbResult);
						} catch (error) {
							errorCount++;
							const errorMsg =
								error instanceof Error ? error.message : "Unknown error";
							errors.push({ routine: routineDesc, error: errorMsg });
							failedEntries.push({ routine: routineDesc, error: errorMsg });
							logger.error("Error processing routine", {
								routine: routineDesc,
								error: errorMsg,
							});
						}
					}
				}

				const totalDuration = Date.now() - batchStartTime;
				const summary = {
					success: true,
					duration: `${(totalDuration / 1000).toFixed(2)}s`,
					stats: {
						total: successCount + skipCount + errorCount,
						successful: successCount,
						skipped: skipCount,
						failed: errorCount,
					},
					dates: weekDates.length,
					failedEntries,
				};

				logger.info("Batch processing completed", { summary });
				return summary;
			} catch (error) {
				logger.error("Error in fetching and populating week routines", {
					error: error instanceof Error ? error.message : error,
				});

				throw mapToAppError(error);
			}
		},
		async fetchRoutineByDate(date: string) {
			try {
				const token = await routineIntegrationServices.getAuthToken();
				if (!token) {
					throw new ExternalServiceError(
						"Routine Integration",
						"Failed to obtain auth token",
					);
				}
				const result = await routineIntegrationServices.getRoutinesofDate(
					token,
					date,
				);
				if (!result) {
					throw new NotFoundError("Routines for the date");
				}
				return result;
			} catch (error) {
				throw mapToAppError(error);
			}
		},
	};
}
