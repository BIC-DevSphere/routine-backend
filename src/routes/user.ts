import { Router } from "express";
import UserController from "@/controllers/user.controller";
import { authMiddleware } from "@/middleware/auth";

const router = Router();

const userController = new UserController();

router.use(authMiddleware.authenticate);
router.get("/profile", userController.getUserProfile.bind(userController));
router.patch("/profile", userController.updateUserProfile.bind(userController));

// Admin routes
// TODO: Handle isAdmin middleware
router.get("/users", userController.getAllUsers.bind(userController));
router.patch(
	"/users/:id",
	userController.updateUserByAdmin.bind(userController),
);
router.delete(
	"/users/:id",
	userController.deleteUserByAdmin.bind(userController),
);
export default router;
