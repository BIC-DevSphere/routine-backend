import { Router } from "express";
import { IssueController } from "@/controllers/issue.controller";
import prisma from "@/db";
import { authMiddleware } from "@/middleware/auth";
import { createIssueService } from "@/services/issue.service";

const router = Router();

// Create issue service and controller
const issueService = createIssueService(prisma);
const issueController = new IssueController(issueService);

router.use(authMiddleware.authenticate);

// User routes
router.post("/", issueController.createIssue);
router.get("/my-issues", issueController.getMyIssues);

router.use(authMiddleware.isAdmin);

// Admin routes
router.get("/admin", issueController.getIssues);
router.get("/admin/stats", issueController.getIssueStats);
router.get("/admin/:id", issueController.getIssues);
router.put("/admin/:id", issueController.updateIssue);
router.patch("/admin/:id/status", issueController.updateIssueStatus);
router.delete("/admin/:id", issueController.deleteIssue);

export default router;
