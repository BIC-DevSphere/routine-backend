import { Router } from "express";
import GroupController from "@/controllers/group.controller";
import prisma from "@/db";
import { authMiddleware } from "@/middleware/auth";
import { createGroupService } from "@/services/group.service";

const router = Router();
const groupService = createGroupService(prisma);
const groupController = new GroupController(groupService);

router.use(authMiddleware.authenticate);

router.get("/", groupController.getAll.bind(groupController));
router.get("/:id", groupController.getById.bind(groupController));
router.post("/", groupController.create.bind(groupController));
router.put("/:id", groupController.update.bind(groupController));
router.delete("/:id", groupController.delete.bind(groupController));

export default router;
