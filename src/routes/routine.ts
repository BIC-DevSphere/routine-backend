import { Router } from "express";
import RoutineController from "@/controllers/routine.controller";
import prisma from "@/db";
import { authMiddleware } from "@/middleware/auth";
import { createRoutineService } from "@/services/routine.service";
import { createRoutineSyncService } from "@/services/routineSync.service";

const router = Router();
const routineService = createRoutineService(prisma);
const routineSyncService = createRoutineSyncService(prisma, routineService);
const routineController = new RoutineController(
	routineService,
	routineSyncService,
);

router.use(authMiddleware.authenticate);
// router.get("/", routineController.getAllRoutines);

router.get(
	"/group",
	routineController.getAllRoutinesByGroup.bind(routineController),
);

router.post("/", routineController.addRoutine.bind(routineController));

router.post(
	"/fetch-by-date",
	routineController.fetchRoutineByDate.bind(routineController),
);
router.post(
	"/fetch-week",
	routineController.fetchWeekRoutines.bind(routineController),
);

router.post(
	"/sync-routine",
	routineController.syncRoutineByDate.bind(routineController),
);
export default router;
