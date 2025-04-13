import { listenToQueue } from "../lib/amqpListener";
import { asyncHandler } from "../utils/asyncHandler";
import type { Request, Response } from "express";


const getTeachers = asyncHandler(async (req: Request , res: Response) => {
    try {
        const teachersData = await listenToQueue();
        // if (!teachersData) {
        //     return res.status(500).json("No data found");
        // }
        return res.status(200).json({success: true, data: teachersData})
    } catch (error) {
        return res.status(500).json("Something went wrong" );
    }
})

export {getTeachers};