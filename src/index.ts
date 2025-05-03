import express from "express";
import 'dotenv/config';
import { routineRouter } from "./routes/routinesRoutes";
import { initializeRabbitMQ, listenToRoutineQueue } from "./lib/amqpListener";

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

initializeServer();
