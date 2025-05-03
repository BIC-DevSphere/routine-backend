import express from "express";
import 'dotenv/config';
import { teacherRouter } from "./routes/teachersRoutes";
import { listenToQueues } from "./lib/amqpListener";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {
	res.send("Hello, World!");
});
app.use("/api/teachers", teacherRouter);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
    
    listenToQueues()
        .then(() => console.log('RabbitMQ listener initialized successfully'))
        .catch(error => console.error('Failed to initialize RabbitMQ listener:', error));
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});