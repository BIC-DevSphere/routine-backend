import { listenToQueues, sendToQueue, QUEUES } from "../lib/amqpListener";
import { asyncHandler } from "../utils/asyncHandler";
import type { Request, Response } from "express";

const getTeachers = asyncHandler(async (req: Request , res: Response) => {
    try {
        return res.status(200).json({
            success: true, 
            message: "RabbitMQ listener is active. Check server logs for incoming messages."
        });
    } catch (error) {
        console.error("Error in getTeachers:", error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

const addTeacher = asyncHandler(async (req: Request, res: Response) => {
    try {
        const teacherData = req.body;
        
        if (!teacherData || Object.keys(teacherData).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No teacher data provided" 
            });
        }
        
        const messageToSend = {
            ...teacherData,
            timestamp: new Date().toISOString()
        };
        
        await sendToQueue(QUEUES.TEACHER_REGISTRATION, messageToSend);
        
        return res.status(200).json({ 
            success: true, 
            message: "Teacher added to queue successfully", 
            data: messageToSend 
        });
    } catch (error) {
        console.error("Error in addTeacher:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to add teacher to queue" 
        });
    }
});

export { getTeachers, addTeacher };