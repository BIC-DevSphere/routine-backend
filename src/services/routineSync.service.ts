import type { PrismaClient } from "@prisma/client";
import type { RoutineEntry } from "@/types/externalApi.types";
import { DatabaseError, mapToAppError } from "@/utils/errors";
import { checkRoutineValidity } from "@/utils/routine.validator";
import type { RoutineService } from "./routine.service";
import { routineHashService } from "./routineHash.service";
import { routineIntegrationServices } from "./routineIntegration.service";

export type RoutineSyncService = {
	syncDailyRoutine(token: string, date?: string): Promise<any>;
	deactivateRoutine(dbRoutine: any, results: any): Promise<void>;
	deactivateAllRoutines(): Promise<any>;
};

export function createRoutineSyncService(
	prisma: PrismaClient,
	routineService: RoutineService,
): RoutineSyncService {
	return {
		// TODO: Resolve prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }
		async syncDailyRoutine(token: string, date = "2025-11-13") {
			try {
				console.log(`Syncing routines for ${date}`);

				const dayOfWeek = new Date(date)
					.toLocaleDateString("en-US", { weekday: "short" })
					.toLowerCase();

				const dbRoutines = await routineService.getRoutinesByDay(dayOfWeek);
				const apiResponse = await routineIntegrationServices.getRoutinesofDate(
					token,
					`${date}T00:00:00Z`,
				);

				if (!apiResponse?.list || !Array.isArray(dbRoutines)) {
					return { success: false, error: "Failed to fetch data" };
				}

				console.log(
					`DB: ${dbRoutines.length}, API: ${apiResponse.list.length}`,
				);

				// Create hash sets
				const dbHashSet = new Set(
					dbRoutines.map((r) => r.hash).filter((h) => h !== null),
				);

				// Filter valid API routines BEFORE creating hashes
				const validApiRoutines = apiResponse.list.filter((r) =>
					checkRoutineValidity(r),
				);

				console.log(
					`✅ Valid API routines: ${validApiRoutines.length} out of ${apiResponse.list.length}`,
				);

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

				console.log(
					`🔑 DB Hashes: ${dbHashSet.size}, API Hashes: ${apiHashSet.size}`,
				);

				// Debug: Log all hashes
				console.log(
					"📋 DB Hash Set:",
					Array.from(dbHashSet).map((h) => h.substring(0, 8)),
				);
				console.log(
					"📋 API Hash Set:",
					Array.from(apiHashSet).map((h) => h.substring(0, 8)),
				);

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

				console.log(
					`New: ${newHashes.size}, Removed: ${removedHashes.size}, Same: ${sameHashes.size}`,
				);

				// Debug: Show which hashes are in each category
				if (newHashes.size > 0) {
					console.log(
						"New hashes:",
						Array.from(newHashes).map((h) => h.substring(0, 8)),
					);
				}
				if (removedHashes.size > 0) {
					console.log(
						"Removed hashes:",
						Array.from(removedHashes).map((h) => h.substring(0, 8)),
					);
				}
				if (sameHashes.size > 0) {
					console.log(
						"Same hashes:",
						Array.from(sameHashes).map((h) => h.substring(0, 8)),
					);
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
					console.log(`Adding ${newHashes.size} new routines...`);
					for (const hash of newHashes) {
						const apiRoutine = apiHashMap.get(hash);
						if (!apiRoutine) continue;

						try {
							const result =
								await routineService.addRoutineEntryToDb(apiRoutine);
							if (result?.success) {
								results.added++;
								console.log(
									`Added: ${apiRoutine.moduleDto?.name} (hash: ${hash.substring(
										0,
										8,
									)})`,
								);
							} else {
								results.errors.push(
									`Failed to add: ${apiRoutine.moduleDto?.name}`,
								);
							}
						} catch (error) {
							results.errors.push(
								`Error adding: ${apiRoutine.moduleDto?.name}`,
							);
							console.error("Error:", error);
						}
					}
				}

				// 2. Mark removed routines as inactive (removed_entries = internal_set - external_set)
				if (removedHashes.size > 0) {
					console.log(
						`Marking ${removedHashes.size} removed routines as inactive...`,
					);
					for (const dbRoutine of dbRoutines) {
						if (dbRoutine.hash && removedHashes.has(dbRoutine.hash)) {
							await this.deactivateRoutine(dbRoutine, results);
						}
					}
				}

				// 3. Same entries - skip
				if (sameHashes.size > 0) {
					console.log(`${sameHashes.size} routines unchanged - skipped`);
				}

				console.log("Sync complete:", {
					added: results.added,
					removed: results.removed,
					unchanged: results.unchanged,
					errors: results.errors.length,
				});

				return results;
			} catch (error) {
				console.log("Error in syncing daily routine:", error);
				// return { success: false, error: `${error}` };
				throw mapToAppError(error);
			}
		},

		// TODO: Add appropriate types
		async deactivateRoutine(dbRoutine: any, results: any) {
			try {
				await prisma.routine.update({
					where: { id: dbRoutine.id },
					data: { isActive: false },
				});
				results.removed++;
				console.log(
					`Marked inactive: ${
						dbRoutine.module.name
					} (hash: ${dbRoutine.hash.substring(0, 8)})`,
				);
			} catch (error) {
				results.errors.push(`Error removing: ${dbRoutine.module.name}`);
				console.error("Error:", error);
			}
		},

		async deactivateAllRoutines() {
			try {
				const updateResult = await prisma.routine.updateMany({
					where: { isActive: true },
					data: { isActive: false },
				});
				if (!updateResult) {
					// return { success: false, error: "Failed to deactivate routines" };
					throw new DatabaseError("Failed to deactivate routines");
				}
				console.log(`Marked inactive: ${updateResult.count} routines`);
				return {
					success: true,
					message: `${updateResult.count} routines marked inactive`,
				};
			} catch (error) {
				console.error("Error deactivating all routines:", error);
				// return { success: false, error: `${error}` };
				throw mapToAppError(error);
			}
		},
	};
}
