import { prisma } from "../config/database";
import { RoutineData } from "../types/routine";

export async function processRoutineData(routineData: RoutineData) {
    try {
        const routine = await prisma.routine.upsert({
            where: {
                id: routineData.timeTables.length > 0 ? routineData.timeTables[0].newRoutineId : 0,
            },
            update: {
                startTime: routineData.startTime,
                endTime: routineData.endTime,
            },
            create: {
                id: routineData.timeTables.length > 0 ? routineData.timeTables[0].newRoutineId : 0,
                startTime: routineData.startTime,
                endTime: routineData.endTime,
            },
        });

        for (const timeTableData of routineData.timeTables) {
            const teacherId = Math.floor(Math.random() * 100000);
            const teacher = await prisma.teacher.upsert({
                where: { id: teacherId },
                update: {
                    email: timeTableData.lecturerEmail,
                    name: timeTableData.lecturerEmail.split('@')[0],
                },
                create: {
                    id: teacherId,
                    name: timeTableData.lecturerEmail.split('@')[0],
                    email: timeTableData.lecturerEmail,
                },
            });

            const subjectParts = timeTableData.subject.split(' ');
            const subjectCode = subjectParts[0];
            const subjectName = subjectParts.slice(1).join(' ');

            const subject = await prisma.subject.upsert({
                where: { 
                    id: parseInt(subjectCode.replace(/\D/g, ''), 10) || Math.floor(Math.random() * 100000)
                },
                update: {
                    teacherId: teacher.id,
                },
                create: {
                    name: subjectName,
                    subjectCode: subjectCode,
                    teacherId: teacher.id,
                },
            });

            const timeTableId = parseInt(timeTableData.newRoutineId.toString() + timeTableData.day, 10) % 1000000000;

            await prisma.timeTable.upsert({
                where: { id: timeTableId },
                update: {
                    day: timeTableData.day,
                    minutes: timeTableData.minutes.toString(),
                    room: timeTableData.room,
                    group: timeTableData.group || '',
                    course: timeTableData.course || '',
                    timeStart: timeTableData.timeStart,
                    timeEnd: timeTableData.timeEnd,
                    teacherId: teacher.id,
                    subjectId: subject.id,
                    routinedId: routine.id,
                },
                create: {
                    newRoutineId: timeTableData.newRoutineId.toString(),
                    day: timeTableData.day,
                    minutes: timeTableData.minutes.toString(),
                    room: timeTableData.room,
                    group: timeTableData.group || '',
                    course: timeTableData.course || '',
                    timeStart: timeTableData.timeStart,
                    timeEnd: timeTableData.timeEnd,
                    teacherId: teacher.id,
                    subjectId: subject.id,
                    routinedId: routine.id,
                },
            });
        }

        return true;
    } catch (error) {
        console.error('Error processing routine data:', error);
        return false;
    }
}
