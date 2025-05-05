import express from "express";
import 'dotenv/config';
import { routineRouter } from "./routes/routinesRoutes";
import { initializeRabbitMQ, listenToRoutineQueue } from "./lib/amqpListener";
import { prisma } from "./config/database";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {
    res.send("Routine Management Service");
});

app.use("/api/routines", routineRouter);

const port = process.env.PORT || 3000;

const initializeServer = async () => {
    try {
        // Test database connection
        console.log("Testing database connection...");
        await prisma.$connect();
        console.log("Database connection established successfully");
        
        console.log("Initializing RabbitMQ connection...");
        await initializeRabbitMQ();
        
        console.log("Starting to listen to routine queue...");
        await listenToRoutineQueue();
        
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to initialize server:", error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

initializeServer();
