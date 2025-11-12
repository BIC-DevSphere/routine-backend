import { Router } from "express";
import AppVersionController from "@/controllers/appVersion.controller";
import prisma from "@/db";
import { authMiddleware } from "@/middleware/auth";
import { createAppVersionService } from "@/services/appVersion.service";

const router = Router();
const appVersionService = createAppVersionService(prisma);
const appVersionController = new AppVersionController(appVersionService);

router.get("/", appVersionController.getAll.bind(appVersionController));

router.use(authMiddleware.authenticate);

router.get("/:id", appVersionController.getById.bind(appVersionController));
router.post("/", appVersionController.create.bind(appVersionController));
router.put("/:id", appVersionController.update.bind(appVersionController));
router.delete("/:id", appVersionController.delete.bind(appVersionController));

export default router;
