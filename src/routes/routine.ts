import { Router } from "express";
import RoutineController from "@/controllers/routine";
import prisma from "@/db";
import { createRoutineService } from "@/services/routine";

const router = Router();
const routineService = createRoutineService(prisma);
const routineController = new RoutineController(routineService);

router.get("/group/:groupId", routineController.getAllRoutineByGroup);

export default router;
