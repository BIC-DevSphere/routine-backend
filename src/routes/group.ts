import { Router } from "express";
import GroupController from "@/controllers/group.controller";
import prisma from "@/db";
import { createGroupService } from "@/services/group.service";

const router = Router();
const groupService = createGroupService(prisma);
const groupController = new GroupController(groupService);

// router.use(authMiddleware.authenticate)

router.get("/", groupController.getAllGroups.bind(groupController));

export default router;
