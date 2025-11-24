import cron from "node-cron";
import prisma from "@/db";
import { logger } from "@/lib/logger";
import { createModuleService } from "@/services/module.service";
import { createRoomService } from "@/services/room.service";
import { createRoutineService } from "@/services/routine.service";
import { routineIntegrationServices } from "@/services/routineIntegration.service";
import { createRoutineSyncService } from "@/services/routineSync.service";
import { createTeacherService } from "@/services/teacher.service";

/**
 * Daily Routine Sync Cron Job
 *
 * Runs every day of the week at 00:01 except for Saturdays
 */
const routineSyncCron = async () => {
	const todaysDate = new Date();
	const todaysDateString = todaysDate.toISOString();

	try {
		logger.info("Starting daily routine sync cron", {
			currentTime: todaysDate.toISOString(),
			targetDate: todaysDateString,
			targetDay: new Date(todaysDateString).toLocaleDateString("en-us", {
				weekday: "long",
			}),
		});

		const roomService = createRoomService(prisma);
		const teacherService = createTeacherService(prisma);
		const moduleService = createModuleService(prisma);
		const routineService = createRoutineService(
			prisma,
			teacherService,
			roomService,
			moduleService,
		);
		const routineSyncService = createRoutineSyncService(prisma, routineService);
		const authToken = await routineIntegrationServices.getAuthToken();

		if (!authToken) {
			logger.error("Failed to obtain auth token for routine sync");
			return;
		}

		const routineSyncResult = await routineSyncService.syncDailyRoutine(
			authToken,
			todaysDateString,
		);

		logger.info("Daily routine sync cron completed", {
			result: routineSyncResult,
		});
	} catch (error) {
		logger.error("Error during daily routine sync cron job", { error });
	} finally {
		await prisma.$disconnect();
	}
};

export const startDailyRoutineSyncJob = () => {
	cron.schedule("1 0 * * 0-5", routineSyncCron);
	console.log("Contributor cron job scheduled");
};
