export interface TimeTableData {
    day: string;
    timeStart: string;
    timeEnd: string;
    minutes: number;
    subject: string;
    lecturerEmail: string;
    group: string;
    room: string;
    course: string | null;
    newRoutineId: number;
    previousRoutineIds: number[];
}

export interface RoutineData {
    startTime: string;
    endTime: string;
    timeTables: TimeTableData[];
}