import { asyncHandler } from "../utils/asyncHandler";
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getRoutineStatus = asyncHandler(async (req: Request, res: Response) => {
    console.log("getRoutineStatus endpoint hit.");

    try {
        await prisma.$connect();
        console.log("Database connection verified.");

        const envVariable = process.env.RABBITMQ_HOST || "default_value";

        return res.status(200).json({
            success: true, 
            message: "Routine processing service is active",
            envVariable: envVariable
        });
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
        const routines = await prisma.routine.findMany({
            include: {
                timeTables: {
                    include: {
                        subject: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            data: routines
        });
    } catch (error) {
        console.error("Error fetching routine data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve routine data"
        });
    }
});

export { getRoutineStatus, getRoutineData };