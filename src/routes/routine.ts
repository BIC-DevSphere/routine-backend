import { Router } from "express";
import RoutineController from "@/controllers/routine.controller";
import prisma from "@/db";
import { authMiddleware } from "@/middleware/auth";
import { createModuleService } from "@/services/module.service";
import { createRoomService } from "@/services/room.service";
import { createRoutineService } from "@/services/routine.service";
import { createRoutineSyncService } from "@/services/routineSync.service";
import { createTeacherService } from "@/services/teacher.service";

const router = Router();
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

// router.post(
// 	"/sync-routine",
// 	routineController.syncRoutineByDate.bind(routineController),
// );

// ADMIN ROUTES
router.use(authMiddleware.isAdmin);
router.get(
	"/admin/group",
	routineController.getAllRoutinesByAdmin.bind(routineController),
);
router.post(
	"/admin/sync-weekly",
	routineController.syncWeeklyRoutines.bind(routineController),
);
export default router;
