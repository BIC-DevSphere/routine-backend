import {Router} from "express"
import { getTeachers, addTeacher, addManualDataToQueue, displayManualData } from "../controllers/teacherController";

const teacherRouter = Router();

teacherRouter.route('/')
    .get(getTeachers)
    .post(addTeacher);

// Route to add manual data to the queue
teacherRouter.route('/add-manual').get(addManualDataToQueue);

// Route to display manual data
teacherRouter.route('/display-manual').get(displayManualData);

export {teacherRouter};