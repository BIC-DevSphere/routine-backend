import {Router} from "express"
import { getRoutine, getRoutineData } from "../controllers/routineController";

const routineRouter = Router();

routineRouter.route('/')
    .post(getRoutine);

routineRouter.route('/data')
    .get(getRoutineData);

export {routineRouter};