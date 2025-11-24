import { Router } from "express";
import UserController from "@/controllers/user.controller";
import prisma from "@/db";
import { authMiddleware } from "@/middleware/auth";
import { createUserService } from "@/services/user.service";

const router = Router();

const userService = createUserService(prisma);
const userController = new UserController(userService);

router.use(authMiddleware.authenticate);
router.get("/profile", userController.getUserProfile.bind(userController));
router.put("/profile", userController.updateUserProfile.bind(userController));

// Admin routes

router.use(authMiddleware.isAdmin);
router.get("/users", userController.getAllUsers.bind(userController));
router.put("/users/:id", userController.updateUserByAdmin.bind(userController));
router.delete(
	"/users/:id",
	userController.deleteUserByAdmin.bind(userController),
);
export default router;
