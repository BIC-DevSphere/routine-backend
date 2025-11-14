import { Router } from "express";
import { ModuleController } from "@/controllers/module.controller";
import prisma from "@/db";
import { authMiddleware } from "@/middleware/auth";
import { createModuleService } from "@/services/module.service";

const router = Router();
const moduleService = createModuleService(prisma);
const moduleController = new ModuleController(moduleService);

router.use(authMiddleware.authenticate);

router.get("/", moduleController.getAll.bind(moduleController));
router.get("/:id", moduleController.getById.bind(moduleController));
router.post("/", moduleController.create.bind(moduleController));
router.put("/:id", moduleController.update.bind(moduleController));
router.delete("/:id", moduleController.delete.bind(moduleController));

export default router;
