import { asyncHandler } from "../utils/asyncHandler";
import type { Request, Response } from "express";
import { prisma } from "../config/database";

const getRoutine = asyncHandler(async (req: Request, res: Response) => {
    const { course, group } = req.body;
    try {
        const routine = await prisma.routine.findMany({
            where: {
                timeTables: {
                    some: {
                        course,
                        group
                    }
                }
            },
            include: {
                timeTables: true
            }
        });

        if (routine.length > 0) {
            return res.status(200).json({ success: true, data: routine });
        } else {
            return res.status(404).json({ success: false, message: "Routine not found" });
        }
    } catch (error) {
        console.error("Error fetching routine:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve routine",
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

export { getRoutine, getRoutineData };