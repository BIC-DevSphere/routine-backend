import {Router} from "express"
import { getRoutineStatus, getRoutineData } from "../controllers/routineController";

const routineRouter = Router();

routineRouter.route('/')
    .get(getRoutineStatus);

routineRouter.route('/data')
    .get(getRoutineData);

export {routineRouter};