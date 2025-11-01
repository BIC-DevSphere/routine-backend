import { NotFoundError } from "@/utils/errors";
import type { PrismaClient, User } from "@prisma/client";

export type UserService = {
    getUserProfile(userId: string): Promise<User>;
};

export function createUserService(prisma: PrismaClient): UserService {
    return {
        async getUserProfile(userId: string) {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
            if (!user) throw new NotFoundError("user")
            
            return user
        }

    }
}