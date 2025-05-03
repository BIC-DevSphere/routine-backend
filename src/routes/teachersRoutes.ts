import {Router} from "express"
import { getTeachers, addTeacherToQueue } from "../controllers/teacherController";

const teacherRouter = Router();

teacherRouter.route('/')
    .get(getTeachers)
    .post(addTeacherToQueue);

export {teacherRouter};