import type { PrismaClient } from "@prisma/client";

export type GroupService = {
	getAllGroups(): Promise<any>;
};

export function createGroupService(prisma: PrismaClient): GroupService {
	return {
		async getAllGroups() {
			try {
				const groups = await prisma.group.findMany({
					select: {
						id: true,
						name: true,
					},
				});

				if (!groups || groups.length === 0) {
					return { success: false, error: "No groups found" };
				}
				return { success: true, data: groups };
			} catch (error) {
				console.error("Error fetching groups:", error);
				return { success: false, error: "Failed to fetch groups" };
			}
		},
	};
}
