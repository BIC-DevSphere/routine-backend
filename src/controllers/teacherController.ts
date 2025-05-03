import { listenToQueues, sendToQueue, QUEUES } from "../lib/amqpListener";
import { asyncHandler } from "../utils/asyncHandler";
import type { Request, Response } from "express";

interface TeacherData {
    name: string;
    subject: string;
    email: string;
    timestamp: string;
}

const manualData: TeacherData[] = [];

const getTeachers = asyncHandler(async (req: Request , res: Response) => {
    try {
        // This API doesn't need to actively listen since we've already setup listeners at server startup
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
        
        // Add timestamp to the data
        const messageToSend = {
            ...teacherData,
            timestamp: new Date().toISOString()
        };
        
        // Send teacher data to the teacher registration queue
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

const addManualDataToQueue = asyncHandler(async (req: Request, res: Response) => {
    try {
        const manualTeacherData = {
            name: "Manual Teacher",
            subject: "Science",
            email: "manual.teacher@example.com",
            timestamp: new Date().toISOString()
        };

        // Add to queue
        await sendToQueue(QUEUES.TEACHER_REGISTRATION, manualTeacherData);

        // Store locally for display
        manualData.push(manualTeacherData);

        return res.status(200).send("Manual data added to the queue successfully.");
    } catch (error) {
        console.error("Error in addManualDataToQueue:", error);
        return res.status(500).send("Failed to add manual data to the queue.");
    }
});

const displayManualData = asyncHandler(async (req: Request, res: Response) => {
    try {
        return res.status(200).json({
            success: true,
            data: manualData
        });
    } catch (error) {
        console.error("Error in displayManualData:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve manual data."
        });
    }
});

export { getTeachers, addTeacher, addManualDataToQueue, displayManualData };