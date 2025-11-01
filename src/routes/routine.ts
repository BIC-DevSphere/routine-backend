import { Router } from "express";
import RoutineController from "@/controllers/routine";
import prisma from "@/db";
import { createRoutineService } from "@/services/routine";
import { authMiddleware } from "@/middleware/auth";

const router = Router();
const routineService = createRoutineService(prisma);
const routineController = new RoutineController(routineService);

router.use(authMiddleware.authenticate)
router.get("/group", routineController.getAllRoutineByGroup);

export default router;
