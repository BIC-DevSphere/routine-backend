import { Router } from "express";
import RoutineController from "@/controllers/routine.controller";
import { authMiddleware } from "@/middleware/auth";
import { RoutineService } from "@/services/routine.service";

const router = Router();
const routineService = new RoutineService();
const routineController = new RoutineController(routineService);

// router.use(authMiddleware.authenticate)
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
