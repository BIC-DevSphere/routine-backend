import { asyncHandler } from "../utils/asyncHandler";
import type { Request, Response } from "express";
import { prisma } from "../config/database";

const getRoutineStatus = asyncHandler(async (req: Request, res: Response) => {
    try {
        // Test the database connection
        await prisma.$queryRaw`SELECT 1`;
        console.log("Database connection verified.");

        return res.status(200).json({
            success: true, 
            message: "Routine processing service is active"});
    
    } catch (error) {
        console.error("Error in getRoutineStatus:", error);
        return res.status(500).json({
            success: false, 
            message: "Something went wrong with the routine service",
            error: (error as Error).message
        });
    }
});

const getRoutineData = asyncHandler(async (req: Request, res: Response) => {
    try {
        console.log("Fetching routine data...");
        const routines = await prisma.routine.findMany({
            include: {
                timeTables: {
                    include: {
                        subject: true
                    }
                }
            }
        });
        console.log("Routine data fetched successfully:", JSON.stringify(routines, null, 2));

        return res.status(200).json({
            success: true,
            data: routines
        });
    } catch (error) {
        console.error("Error fetching routine data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve routine data",
            error: (error as Error).message
        });
    }
});

export { getRoutineStatus, getRoutineData };