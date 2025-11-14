import { Router } from "express";
import { RoomController } from "@/controllers/room.controller";
import prisma from "@/db";
import { authMiddleware } from "@/middleware/auth";
import { createRoomService } from "@/services/room.service";

const router = Router();
const roomService = createRoomService(prisma);
const roomController = new RoomController(roomService);

router.use(authMiddleware.authenticate);

router.get("/", roomController.getAll.bind(roomController));
router.get("/:id", roomController.getById.bind(roomController));
router.post("/", roomController.create.bind(roomController));
router.put("/:id", roomController.update.bind(roomController));
router.delete("/:id", roomController.delete.bind(roomController));

export default router;
