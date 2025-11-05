import { Router } from "express";
import GroupController from "@/controllers/group.controller";
import { GroupService } from "@/services/group.service";

const router = Router();
const groupService = new GroupService();
const groupController = new GroupController(groupService);

// router.use(authMiddleware.authenticate)

router.get("/", groupController.getAllGroups.bind(groupController));

export default router;
