import amqp from 'amqplib';
import dotenv from 'dotenv';
import { RoutineData } from '../types/routine';
import { processRoutineData } from '../db/queries';

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
