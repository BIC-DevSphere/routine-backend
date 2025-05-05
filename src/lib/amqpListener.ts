import amqp from 'amqplib';
import dotenv from 'dotenv';
import { prisma } from '../config/database';

dotenv.config();

const username = process.env.RABBITMQ_USERNAME || 'guest';
const password = process.env.RABBITMQ_PASSWORD || 'guest';
const host = process.env.RABBITMQ_HOST || 'localhost';
const port = 5672;
const routineQueue = 'routine_registration_queue';

let connection = null;
let channel: amqp.Channel | null = null;

async function initializeRabbitMQ() {
    try {
        connection = await amqp.connect({
            protocol: 'amqp',
            hostname: host,
            port: port,
            username: username,
            password: password
        });

        channel = await connection.createChannel();
        await channel.assertQueue(routineQueue, { durable: true });
        
        return true;
    } catch (error) {
        console.error('Error initializing RabbitMQ:', error);
        return false;
    }
}

interface TimeTableData {
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

interface RoutineData {
    startTime: string;
    endTime: string;
    timeTables: TimeTableData[];
}

async function processRoutineData(routineData: RoutineData) {
    try {
        console.debug('Starting processRoutineData with routineData:', routineData);

        // Create or update the routine
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
        console.debug('Routine upserted:', routine);

        for (const timeTableData of routineData.timeTables) {
            console.debug('Processing timeTableData:', timeTableData);

            // Find or create the teacher based on email
            const teacherId = Math.floor(Math.random() * 100000); // Generate a random ID
            const teacher = await prisma.teacher.upsert({
                where: { id: teacherId }, // Use the generated ID
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
            console.debug('Teacher upserted:', teacher);

            // Extract subject name and code from the subject string
            const subjectParts = timeTableData.subject.split(' ');
            const subjectCode = subjectParts[0];
            const subjectName = subjectParts.slice(1).join(' ');
            console.debug('Extracted subjectCode:', subjectCode, 'subjectName:', subjectName);

            // Find or create the subject
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
            console.debug('Subject upserted:', subject);

            // Create or update the time table entry
            const timeTableId = parseInt(timeTableData.newRoutineId.toString() + timeTableData.day, 10) % 1000000000;
            console.debug('Generated timeTableId:', timeTableId);

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
            console.debug('Time table entry upserted for timeTableId:', timeTableId);
        }

        console.debug('Finished processing routineData successfully');
        return true;
    } catch (error) {
        console.error('Error processing routine data:', error);
        return false;
    }
}

async function listenToRoutineQueue() {
    try {
        if (!channel) {
            await initializeRabbitMQ();
        }

        console.log(`Waiting for messages in ${routineQueue}. To exit press CTRL+C`);

        channel?.consume(routineQueue, async (msg) => {
            if (msg !== null) {
                const message = msg.content.toString();

                try {
                    const routineData = JSON.parse(message) as RoutineData;
                    const result = await processRoutineData(routineData);
                    
                    if (result) {
                        console.log('Routine data processed and saved successfully');
                    } else {
                        console.error('Failed to process routine data');
                    }
                    
                    channel?.ack(msg);
                } catch (err) {
                    console.error('Error processing message:', err);
                    channel?.nack(msg, false, false);
                }
            }
        }, { noAck: false });

        return true;
    } catch (error) {
        console.error('Error in listenToRoutineQueue:', error);
        return false;
    }
}

export { initializeRabbitMQ, listenToRoutineQueue };
