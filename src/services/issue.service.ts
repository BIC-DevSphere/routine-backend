import type {
	IssueReport,
	IssueType,
	PrismaClient,
	ReportStatus,
} from "@prisma/client";
import { mapToAppError, NotFoundError } from "@/utils/errors";
import { type BaseService, createBaseService } from "./base.service";

export type CreateIssueData = {
	issueType: IssueType;
	description: string;
	userId?: string;
	groupId?: string;
};

export type UpdateIssueData = {
	status?: ReportStatus;
	description?: string;
};

export type IssueService = BaseService<IssueReport> & {
	createIssue(data: CreateIssueData): Promise<IssueReport>;
	updateIssueStatus(id: string, status: ReportStatus): Promise<IssueReport>;
	getIssuesByUser(userId: string): Promise<IssueReport[]>;
	getIssuesByGroup(groupId: string): Promise<IssueReport[]>;
	getIssuesByStatus(status: ReportStatus): Promise<IssueReport[]>;
	getIssuesByType(issueType: IssueType): Promise<IssueReport[]>;
	getIssuesWithDetails(id?: string): Promise<IssueReport | IssueReport[]>;
};

export function createIssueService(prisma: PrismaClient): IssueService {
	const baseService = createBaseService<IssueReport>(prisma.issueReport);

	return {
		...baseService,

		async createIssue(data: CreateIssueData): Promise<IssueReport> {
			try {
				const issue = await prisma.issueReport.create({
					data: {
						issueType: data.issueType,
						description: data.description,
						userId: data.userId || null,
						groupId: data.groupId || null,
						status: "OPEN",
					},
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						group: {
							select: {
								id: true,
								name: true,
								course: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				});
				return issue;
			} catch (error) {
				throw mapToAppError(error);
			}
		},

		async updateIssueStatus(
			id: string,
			status: ReportStatus,
		): Promise<IssueReport> {
			try {
				const existingIssue = await prisma.issueReport.findUnique({
					where: { id },
				});

				if (!existingIssue) {
					throw new NotFoundError("Issue report");
				}

				const updatedIssue = await prisma.issueReport.update({
					where: { id },
					data: { status },
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						group: {
							select: {
								id: true,
								name: true,
								course: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				});

				return updatedIssue;
			} catch (error) {
				throw mapToAppError(error);
			}
		},

		async getIssuesByUser(userId: string): Promise<IssueReport[]> {
			try {
				const issues = await prisma.issueReport.findMany({
					where: { userId },
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						group: {
							select: {
								id: true,
								name: true,
								course: {
									select: {
										name: true,
									},
								},
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				});
				return issues;
			} catch (error) {
				throw mapToAppError(error);
			}
		},

		async getIssuesByGroup(groupId: string): Promise<IssueReport[]> {
			try {
				const issues = await prisma.issueReport.findMany({
					where: { groupId },
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						group: {
							select: {
								id: true,
								name: true,
								course: {
									select: {
										name: true,
									},
								},
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				});
				return issues;
			} catch (error) {
				throw mapToAppError(error);
			}
		},

		async getIssuesByStatus(status: ReportStatus): Promise<IssueReport[]> {
			try {
				const issues = await prisma.issueReport.findMany({
					where: { status },
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						group: {
							select: {
								id: true,
								name: true,
								course: {
									select: {
										name: true,
									},
								},
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				});
				return issues;
			} catch (error) {
				throw mapToAppError(error);
			}
		},

		async getIssuesByType(issueType: IssueType): Promise<IssueReport[]> {
			try {
				const issues = await prisma.issueReport.findMany({
					where: { issueType },
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
						group: {
							select: {
								id: true,
								name: true,
								course: {
									select: {
										name: true,
									},
								},
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				});
				return issues;
			} catch (error) {
				throw mapToAppError(error);
			}
		},

		async getIssuesWithDetails(
			id?: string,
		): Promise<IssueReport | IssueReport[]> {
			try {
				const includeOptions = {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					group: {
						select: {
							id: true,
							name: true,
							course: {
								select: {
									name: true,
								},
							},
						},
					},
				};

				if (id) {
					const issue = await prisma.issueReport.findUnique({
						where: { id },
						include: includeOptions,
					});
					if (!issue) {
						throw new NotFoundError("Issue report");
					}
					return issue;
				}

				const issues = await prisma.issueReport.findMany({
					include: includeOptions,
					orderBy: {
						createdAt: "desc",
					},
				});
				return issues;
			} catch (error) {
				throw mapToAppError(error);
			}
		},
	};
}
