import express from "express";
import 'dotenv/config'
import { teacherRouter } from "./routes/teachersRoutes";

const app = express();

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {
	res.send("Hello, World!");
});
app.use("/api/teachers", teacherRouter)

const port = process.env.PORT;


app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});