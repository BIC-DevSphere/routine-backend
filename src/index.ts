import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { auth } from "./lib/auth";
import groupRouter from "./routes/group";
import routineRouter from "./routes/routine";
import userRouter from "./routes/user";

const app = express();

dotenv.config();
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "",
		methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
		credentials: true,
	}),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(express.json());
app.use(morgan("dev"));
app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

app.use("/api/routines", routineRouter);
app.use("/api/groups", groupRouter);
app.use("/api/user", userRouter);
const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
