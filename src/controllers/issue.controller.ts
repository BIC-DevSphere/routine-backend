import type { IssueType, ReportStatus } from "@prisma/client";
import type { Request, Response } from "express";
import { logger } from "@/lib/logger";
import type { IssueService, UpdateIssueData } from "@/services/issue.service";
import { mapToAppError, ValidationError } from "@/utils/errors";
import { BaseController } from "./base";

export class IssueController extends BaseController {
	constructor(private issueService: IssueService) {
		super();
	}

	// Create a new issue report
	createIssue = async (
		req: Request & { user?: { id: string; groupId: string } },
		res: Response,
	) => {
		try {
			const { issueType, description } = req.body;
			const userId = req.userId;
			const groupId = req.groupId;

			logger.debug("Issue data:", { issueType, description, groupId, userId });

			// Validate required fields
			if (!issueType || !description) {
				throw new ValidationError("Issue type and description are required");
			}

			if (!userId) {
				throw new ValidationError("User authentication required");
			}

			// Validate issueType enum
			const validIssueTypes = [
				"MISSING_TEACHER",
				"MISSING_ROUTINE",
				"INCORRECT_TIME",
				"INCORRECT_ROOM",
				"INCORRECT_TEACHER",
				"OTHERS",
			];
			if (!validIssueTypes.includes(issueType)) {
				throw new ValidationError("Invalid issue type");
			}

			const issue = await this.issueService.createIssue({
				issueType: issueType as IssueType,
				description,
				userId,
				groupId,
			});

			this.sendSuccess(res, issue, "Issue report created successfully", 201);
		} catch (error) {
			const appError = mapToAppError(error);
			this.sendError(res, appError);
		}
	};

	getIssues = async (req: Request, res: Response) => {
		try {
			const userId = req.userId;
			const issues = await this.issueService.getIssuesWithDetails(userId);
			const message = userId
				? "Issue report retrieved successfully"
				: "Issue reports retrieved successfully";
			this.sendSuccess(res, issues, message);
		} catch (error) {
			const appError = mapToAppError(error);
			this.sendError(res, appError);
		}
	};

	// Get issues for authenticated user
	getMyIssues = async (
		req: Request & { user?: { id: string } },
		res: Response,
	) => {
		try {
			// const userId = req.user?.id;
			const userId = req.userId;
			if (!userId) {
				throw new ValidationError("User authentication required");
			}

			const issues = await this.issueService.getIssuesByUser(userId);
			this.sendSuccess(res, issues, "Your issues retrieved successfully");
		} catch (error) {
			const appError = mapToAppError(error);
			this.sendError(res, appError);
		}
	};

	// Update issue report status
	updateIssueStatus = async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const { status }: { status: ReportStatus } = req.body;
			console.log("Updating issue status:", id, status);
			// Validate id
			if (!id) {
				throw new ValidationError("Issue ID is required");
			}

			// Validate status
			const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
			if (!status || !validStatuses.includes(status)) {
				throw new ValidationError("Valid status is required");
			}

			const issue = await this.issueService.updateIssueStatus(id, status);
			this.sendSuccess(res, issue, "Issue status updated successfully");
		} catch (error) {
			const appError = mapToAppError(error);
			this.sendError(res, appError);
		}
	};

	// Update issue report data
	updateIssue = async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const updateData: UpdateIssueData = req.body;

			// Validate id
			if (!id) {
				throw new ValidationError("Issue ID is required");
			}

			// Validate status if provided
			if (updateData.status) {
				const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
				if (!validStatuses.includes(updateData.status)) {
					throw new ValidationError("Invalid status");
				}
			}

			const issue = await this.issueService.update(id, updateData);
			this.sendSuccess(res, issue, "Issue report updated successfully");
		} catch (error) {
			const appError = mapToAppError(error);
			this.sendError(res, appError);
		}
	};

	// Delete issue report
	deleteIssue = async (req: Request, res: Response) => {
		try {
			const { id } = req.params;

			// Validate id
			if (!id) {
				throw new ValidationError("Issue ID is required");
			}

			const issue = await this.issueService.delete(id);
			this.sendSuccess(res, issue, "Issue report deleted successfully");
		} catch (error) {
			const appError = mapToAppError(error);
			this.sendError(res, appError);
		}
	};

	// Get issues by user
	getIssuesByUser = async (req: Request, res: Response) => {
		try {
			const { userId } = req.params;
			if (!userId) {
				throw new ValidationError("User ID is required");
			}

			const issues = await this.issueService.getIssuesByUser(userId);
			this.sendSuccess(res, issues, "User issues retrieved successfully");
		} catch (error) {
			const appError = mapToAppError(error);
			this.sendError(res, appError);
		}
	};

	// Get issues by group
	getIssuesByGroup = async (req: Request, res: Response) => {
		try {
			const { groupId } = req.params;
			if (!groupId) {
				throw new ValidationError("Group ID is required");
			}

			const issues = await this.issueService.getIssuesByGroup(groupId);
			this.sendSuccess(res, issues, "Group issues retrieved successfully");
		} catch (error) {
			const appError = mapToAppError(error);
			this.sendError(res, appError);
		}
	};

	// Get issues by status
	getIssuesByStatus = async (req: Request, res: Response) => {
		try {
			const { status } = req.query;
			if (!status) {
				throw new ValidationError("Status query parameter is required");
			}

			const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
			if (!validStatuses.includes(status as string)) {
				throw new ValidationError("Invalid status");
			}

			const issues = await this.issueService.getIssuesByStatus(
				status as ReportStatus,
			);
			this.sendSuccess(
				res,
				issues,
				`Issues with status '${status}' retrieved successfully`,
			);
		} catch (error) {
			const appError = mapToAppError(error);
			this.sendError(res, appError);
		}
	};

	// Get issues by type
	getIssuesByType = async (req: Request, res: Response) => {
		try {
			const { type } = req.query;
			if (!type) {
				throw new ValidationError("Type query parameter is required");
			}

			const validTypes = [
				"MISSING_TEACHER",
				"MISSING_ROUTINE",
				"INCORRECT_TIME",
				"INCORRECT_ROOM",
				"INCORRECT_TEACHER",
				"OTHERS",
			];
			if (!validTypes.includes(type as string)) {
				throw new ValidationError("Invalid issue type");
			}

			const issues = await this.issueService.getIssuesByType(type as IssueType);
			this.sendSuccess(
				res,
				issues,
				`Issues of type '${type}' retrieved successfully`,
			);
		} catch (error) {
			const appError = mapToAppError(error);
			this.sendError(res, appError);
		}
	};

	// Get issue statistics
	getIssueStats = async (_req: Request, res: Response) => {
		try {
			const allIssues = await this.issueService.getAll();

			const stats = {
				total: allIssues.length,
				byStatus: {
					open: allIssues.filter((issue) => issue.status === "OPEN").length,
					inProgress: allIssues.filter(
						(issue) => issue.status === "IN_PROGRESS",
					).length,
					resolved: allIssues.filter((issue) => issue.status === "RESOLVED")
						.length,
					closed: allIssues.filter((issue) => issue.status === "CLOSED").length,
				},
				byType: {
					missingTeacher: allIssues.filter(
						(issue) => issue.issueType === "MISSING_TEACHER",
					).length,
					missingRoutine: allIssues.filter(
						(issue) => issue.issueType === "MISSING_ROUTINE",
					).length,
					incorrectTime: allIssues.filter(
						(issue) => issue.issueType === "INCORRECT_TIME",
					).length,
					incorrectRoom: allIssues.filter(
						(issue) => issue.issueType === "INCORRECT_ROOM",
					).length,
					incorrectTeacher: allIssues.filter(
						(issue) => issue.issueType === "INCORRECT_TEACHER",
					).length,
					others: allIssues.filter((issue) => issue.issueType === "OTHERS")
						.length,
				},
			};

			this.sendSuccess(res, stats, "Issue statistics retrieved successfully");
		} catch (error) {
			const appError = mapToAppError(error);
			this.sendError(res, appError);
		}
	};
}
