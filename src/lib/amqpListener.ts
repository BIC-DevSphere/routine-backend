import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const username = process.env.RABBITMQ_USERNAME || 'guest';
const password = process.env.RABBITMQ_PASSWORD || 'guest';
const host = process.env.RABBITMQ_HOST || 'localhost';
const port = 5672;
const queue = 'teacher_registration_queue';

let connection = null;
let channel: amqp.Channel | null = null;

async function initializeRabbitMQ() {
    try {
        console.debug('Attempting to connect to RabbitMQ server...');
        
        connection = await amqp.connect({
            protocol: 'amqp',
            hostname: host,
            port: port,
            username: username,
            password: password
        });
        console.debug('Successfully connected to RabbitMQ server.');

        channel = await connection.createChannel();
        console.debug('Channel created successfully.');

        console.debug(`Asserting queue: ${queue}`);
        await channel.assertQueue(queue, { durable: true });
        console.debug(`Queue ${queue} asserted successfully.`);
        
        return true;
    } catch (error) {
        console.error('Error initializing RabbitMQ:', error);
        return false;
    }
}

async function listenToQueue() {
    try {
        if (!channel) {
            await initializeRabbitMQ();
        }

        console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel?.consume(queue, (msg) => {
            if (msg !== null) {
                const message = msg.content.toString();
                console.debug('Message received:', message);

                console.log('Received teacher data:', message);
                
                try {
                    const teacherData = JSON.parse(message);
                    console.log('Parsed teacher data:', teacherData);
                } catch (err) {
                    console.error('Error parsing message:', err);
                }

                console.debug('Acknowledging message...');
                channel?.ack(msg);
                console.debug('Message acknowledged.');
            } else {
                console.debug('Received null message.');
            }
        }, { noAck: false });

        return true;
    } catch (error) {
        console.error('Error in listenToQueue:', error);
        return false;
    }
}

interface TeacherData {
    [key: string]: any;
}

async function sendToTeacherQueue(teacherData: TeacherData | string): Promise<boolean> {
    try {
        if (!channel) {
            await initializeRabbitMQ();
        }

        const message = typeof teacherData === 'object' 
            ? JSON.stringify(teacherData) 
            : teacherData;

        const success = channel!.sendToQueue(
            queue, 
            Buffer.from(message),
            { persistent: true }
        );
        
        console.log('Message sent to teacher queue:', message);
        return success;
    } catch (error) {
        console.error('Error sending to queue:', error);
        return false;
    }
}

export { initializeRabbitMQ, listenToQueue, sendToTeacherQueue };
