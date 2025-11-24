import type { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/logger";
import type { RoutineEntry } from "@/types/externalApi.types";
import type { RoutineResponse } from "@/types/routine.types";
import { generateWeekDates } from "@/utils/date";
import {
	DatabaseError,
	ExternalServiceError,
	mapToAppError,
} from "@/utils/errors";
import { checkRoutineValidity } from "@/utils/routine.validator";
import type { RoutineService } from "./routine.service";
import { routineHashService } from "./routineHash.service";
import { routineIntegrationServices } from "./routineIntegration.service";

export type RoutineSyncService = {
	syncDailyRoutine(token: string, date?: string): Promise<DailyResult>;
	deactivateRoutine(
		dbRoutine: RoutineResponse,
		syncId: string,
	): Promise<{ removed: number; errors: string[] }>;
	syncWeeklyRoutine(startDate: string): Promise<WeekResults>;
	deactivateAllRoutines(): Promise<{
		success: boolean;
		errors: string[];
		message?: string;
	}>;
};

type WeekResults = {
	success: boolean;
	startDate: string;
	totalStats: WeekStats;
	dailyResults: DailyResult[];
	errors: string[];
};

type WeekStats = {
	added: number;
	removed: number;
	unchanged: number;
	errors: number;
};

type DailyResult = {
	success: boolean;
	date: string;
	added: number;
	removed: number;
	unchanged: number;
	errors: string[];
};

export function createRoutineSyncService(
	prisma: PrismaClient,
	routineService: RoutineService,
): RoutineSyncService {
	return {
		// TODO: Resolve prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }
		async syncDailyRoutine(
			token: string,
			date = "2025-11-13",
		): Promise<DailyResult> {
			const startTime = Date.now();
			const syncId = `sync_${date}_${startTime}`;
			try {
				logger.info("Starting daily sync", { date });

				const dayOfWeek = new Date(date)
					.toLocaleDateString("en-US", { weekday: "short" })
					.toLowerCase();

				const [dbRoutines, apiResponse] = await Promise.all([
					routineService.getRoutinesByDay(dayOfWeek),
					routineIntegrationServices.getRoutinesofDate(token, date),
				]);

				logger.info("Data fetched successfully", {
					dbCount: dbRoutines.length,
					apiCount: apiResponse.list.length,
				});

				// Create hash sets
				const dbHashSet = new Set(
					dbRoutines.map((r) => r.hash).filter((h) => h !== null),
				);

				// Filter valid API routines BEFORE creating hashes
				const validApiRoutines = apiResponse.list.filter((r) =>
					checkRoutineValidity(r),
				);

				logger.info("Filtered valid routines", {
					validCount: validApiRoutines.length,
					totalApiCount: apiResponse.list.length,
					invalidCount: apiResponse.list.length - validApiRoutines.length,
				});

				const apiHashMap = new Map<string, RoutineEntry>();
				const apiHashSet = new Set<string>();

				// Create hash map for API routines
				for (const routine of validApiRoutines) {
					const hash = routineHashService.createApiRoutineHash(routine);
					if (hash) {
						apiHashSet.add(hash);
						apiHashMap.set(hash, routine);
					}
				}

				logger.debug("Hash sets created", {
					dbHashCount: dbHashSet.size,
					apiHashCount: apiHashSet.size,
					dbHashes: Array.from(dbHashSet).map((h) => h.substring(0, 8)),
					apiHashes: Array.from(apiHashSet).map((h) => h.substring(0, 8)),
				});

				// Set operations
				const newHashes = new Set(
					[...apiHashSet].filter((hash) => !dbHashSet.has(hash)),
				);

				const removedHashes = new Set(
					[...dbHashSet].filter((hash) => !apiHashSet.has(hash)),
				);

				const sameHashes = new Set(
					[...dbHashSet].filter((hash) => apiHashSet.has(hash)),
				);

				logger.info("Sync analysis complete", {
					newCount: newHashes.size,
					removedCount: removedHashes.size,
					unchangedCount: sameHashes.size,
					newHashes: Array.from(newHashes).map((h) => h.substring(0, 8)),
					removedHashes: Array.from(removedHashes).map((h) =>
						h.substring(0, 8),
					),
				});

				// Debug: Show which hashes are in each category
				if (newHashes.size > 0) {
					logger.debug("New hashes", {
						hashes: Array.from(newHashes).map((h) => h.substring(0, 8)),
					});
				}
				if (removedHashes.size > 0) {
					logger.debug("Removed hashes", {
						hashes: Array.from(removedHashes).map((h) => h.substring(0, 8)),
					});
				}
				if (sameHashes.size > 0) {
					logger.debug("Unchanged hashes", {
						hashes: Array.from(sameHashes).map((h) => h.substring(0, 8)),
					});
				}

				const results = {
					success: true,
					date: date,
					added: 0,
					removed: 0,
					unchanged: sameHashes.size,
					errors: [] as string[],
				};

				// 1. Add new routines (new_entries = external_set - internal_set)
				if (newHashes.size > 0) {
					// console.log(`Adding ${newHashes.size} new routines...`);
					logger.info("Adding new routines", { count: newHashes.size });

					for (const hash of newHashes) {
						const apiRoutine = apiHashMap.get(hash);
						if (!apiRoutine) continue;

						try {
							const result =
								await routineService.addRoutineEntryToDb(apiRoutine);
							if (result?.success) {
								results.added++;
							} else {
								results.errors.push(
									`Failed to add: ${apiRoutine.moduleDto?.name}`,
								);
								logger.error("Failed to add routine", {
									routineName: apiRoutine.moduleDto?.name,
									details: result,
								});
							}
						} catch (error) {
							results.errors.push(
								`Error adding: ${apiRoutine.moduleDto?.name}`,
							);
							logger.error("[Sync Error] Error adding routine", {
								routineName: apiRoutine.moduleDto?.name,
								error: error instanceof Error ? error.message : error,
								hash: hash.substring(0, 10),
							});
						}
					}
				}

				// 2. Mark removed routines as inactive (removed_entries = internal_set - external_set)
				if (removedHashes.size > 0) {
					logger.info("Deactivating removed routines", {
						count: removedHashes.size,
					});
					// TODO: Perform batch update instead of one-by-one
					for (const dbRoutine of dbRoutines) {
						if (dbRoutine.hash && removedHashes.has(dbRoutine.hash)) {
							const { removed, errors } = await this.deactivateRoutine(
								dbRoutine,
								syncId,
							);
							results.removed += removed;
							if (errors.length > 0) {
								results.errors.push(...errors);
							}
						}
					}
				}

				// 3. Same entries - skip
				if (sameHashes.size > 0) {
					logger.info("Unchanged routines - skipped", {
						count: sameHashes.size,
					});
				}

				const duration = Date.now() - startTime;

				logger.info("[Sync] Daily sync complete", {
					date,
					duration: `${(duration / 1000).toFixed(2)}s`,
					stats: {
						added: results.added,
						removed: results.removed,
						unchanged: results.unchanged,
						errors: results.errors.length,
					},
				});

				return results;
			} catch (error) {
				logger.error("Daily sync failed", {
					date,
					duration: `${Date.now() - startTime}ms`,
					error: error instanceof Error ? error.message : error,
				});
				throw mapToAppError(error);
			}
		},

		async syncWeeklyRoutine(startDate: string): Promise<WeekResults> {
			const weekId = `week_${startDate}_${Date.now()}`;
			const startTime = Date.now();

			try {
				logger.info("Starting weekly sync", { weekId, startDate });

				const token = await routineIntegrationServices.getAuthToken();

				if (!token) {
					throw new ExternalServiceError(
						"Routine Integration",
						"Failed to obtain auth token",
					);
				}

				const weekDates = generateWeekDates(startDate);
				const weekResults = {
					success: true,
					startDate,
					totalStats: {
						added: 0,
						removed: 0,
						unchanged: 0,
						errors: 0,
					},
					dailyResults: [] as DailyResult[],
					errors: [] as string[],
				};

				for (const date of weekDates) {
					logger.info("[Weekly Sync]--- Syncing for ---", { weekId, date });

					try {
						const dayResult = await this.syncDailyRoutine(token, date);

						weekResults.dailyResults.push(dayResult);

						weekResults.totalStats.added += dayResult.added;
						weekResults.totalStats.removed += dayResult.removed;
						weekResults.totalStats.unchanged += dayResult.unchanged;

						logger.debug("Date processed successfully", {
							weekId,
							date,
							dayStats: {
								added: dayResult.added,
								removed: dayResult.removed,
								unchanged: dayResult.unchanged,
							},
						});
					} catch (error) {
						const errorMsg =
							error instanceof Error ? error.message : "Unknown error";
						weekResults.errors.push(`Error syncing for ${date}: ${errorMsg}`);
						weekResults.totalStats.errors += 1;
						logger.error("Failed to process date", {
							weekId,
							date,
							error: errorMsg,
						});
					}
				}

				const duration = Date.now() - startTime;
				logger.info("Weekly sync completed", {
					weekId,
					duration: `${(duration / 1000).toFixed(2)}s`,
					summary: weekResults.totalStats,
					datesProcessed: weekDates.length,
				});

				return weekResults;
			} catch (error) {
				logger.error("Weekly sync failed", {
					weekId,
					startDate,
					duration: `${(Date.now() - startTime) / 1000}s`,
					error: error instanceof Error ? error.message : error,
				});
				throw mapToAppError(error);
			}
		},

		// TODO: Add appropriate types
		async deactivateRoutine(dbRoutine: RoutineResponse, syncId: string) {
			try {
				await prisma.routine.update({
					where: { id: dbRoutine.id },
					data: { isActive: false },
				});
				// results.removed++;

				logger.info("Deactivated routine", {
					syncId,
					module: dbRoutine.module?.name,
					teacher: dbRoutine.teacher?.name,
					room: dbRoutine.room?.name,
					hash: dbRoutine.hash?.substring(0, 8),
				});

				return { removed: 1, errors: [] };
			} catch (error) {
				const errorMsg = `Error removing: ${dbRoutine.module?.name}`;
				logger.error("Failed to deactivate routine", {
					syncId,
					module: dbRoutine.module?.name,
					hash: dbRoutine.hash?.substring(0, 8),
					error: error instanceof Error ? error.message : error,
				});
				return { removed: 0, errors: [errorMsg] };
			}
		},

		async deactivateAllRoutines(): Promise<{
			success: boolean;
			errors: string[];
			message?: string;
		}> {
			const operationId = `deactivate_all_${Date.now()}`;

			try {
				logger.info("Starting bulk deactivation", { operationId });

				const updateResult = await prisma.routine.updateMany({
					where: { isActive: true },
					data: { isActive: false },
				});
				if (!updateResult) {
					// return { success: false, error: "Failed to deactivate routines" };
					throw new DatabaseError("Failed to deactivate routines");
				}

				logger.info("Bulk deactivation completed", {
					operationId,
					deactivatedCount: updateResult.count,
				});

				return {
					success: true,
					errors: [],
					message: `${updateResult.count} routines marked inactive`,
				};
			} catch (error) {
				logger.error("Bulk deactivation failed", {
					operationId,
					error: error instanceof Error ? error.message : error,
				});
				return {
					success: false,
					errors: [error instanceof Error ? error.message : String(error)],
				};
			}
		},
	};
}
