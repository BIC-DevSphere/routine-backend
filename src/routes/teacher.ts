import { Router } from "express";
import { TeacherController } from "@/controllers/teacher.controller";
import prisma from "@/db";
import { authMiddleware } from "@/middleware/auth";
import { createTeacherService } from "@/services/teacher.service";

const router = Router();
const teacherService = createTeacherService(prisma);
const teacherController = new TeacherController(teacherService);

router.use(authMiddleware.authenticate);

router.get("/", teacherController.getAll.bind(teacherController));
router.get("/:id", teacherController.getById.bind(teacherController));
router.post("/", teacherController.create.bind(teacherController));
router.put("/:id", teacherController.update.bind(teacherController));
router.delete("/:id", teacherController.delete.bind(teacherController));
router.get(
	"/email/:email",
	teacherController.getByEmail.bind(teacherController),
);

export default router;
