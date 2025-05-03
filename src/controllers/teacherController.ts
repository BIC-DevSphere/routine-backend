import { listenToQueue, sendToTeacherQueue } from "../lib/amqpListener";
import { asyncHandler } from "../utils/asyncHandler";
import type { Request, Response } from "express";

const getTeachers = asyncHandler(async (req: Request, res: Response) => {
    try {
        const teachersData = await listenToQueue();
        return res.status(200).json({success: true, data: teachersData})
    } catch (error) {
        return res.status(500).json("Something went wrong" );
    }
});

const addTeacherToQueue = asyncHandler(async (req: Request, res: Response) => {
    try {
        const teacherData = req.body;
        
        if (!teacherData.name) {
            return res.status(400).json({
                success: false, 
                message: "Teacher name is required"
            });
        }
        
        const result = await sendToTeacherQueue(teacherData);
        
        if (result) {
            return res.status(201).json({
                success: true, 
                message: "Teacher data added to queue successfully"
            });
        } else {
            return res.status(500).json({
                success: false, 
                message: "Failed to add teacher data to queue"
            });
        }
    } catch (error) {
        console.error("Error adding teacher to queue:", error);
        return res.status(500).json({
            success: false, 
            message: "Something went wrong"
        });
    }
});

export { getTeachers, addTeacherToQueue };