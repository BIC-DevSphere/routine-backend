import {Router} from "express"
import { getTeachers } from "../controllers/teacherController";

const teacherRouter = Router();

teacherRouter.route('/').get(getTeachers)

export {teacherRouter};