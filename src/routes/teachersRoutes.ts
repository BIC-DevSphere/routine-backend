import {Router} from "express"
import { getTeachers, addTeacher } from "../controllers/teacherController";

const teacherRouter = Router();

teacherRouter.route('/')
    .get(getTeachers)
    .post(addTeacher);

export {teacherRouter};