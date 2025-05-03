import * as amqplib from 'amqplib';
import { Connection, Channel, ConsumeMessage } from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const username = process.env.RABBITMQ_USERNAME || 'guest';
const password = process.env.RABBITMQ_PASSWORD || 'jrCumlkzND96okF';
const host = process.env.RABBITMQ_HOST || 'routine-rabbitmq.inggroup.com.np';
const port = 5672;

const QUEUES = {
    ROUTINE_REGISTRATION: 'routine_registration_queue',
    TEACHER_REGISTRATION: 'teacher_registration_queue'
};

let connection: Connection | null = null;
let channel: Channel | null = null;

async function initializeRabbitMQ(): Promise<{ connection: Connection, channel: Channel }> {
    try {
        if (!connection) {
            const amqpUrl = `amqp://${username}:${password}@${host}:${port}`;
            connection = await amqplib.connect(amqpUrl);
        }

        if (!channel && connection) {
            channel = await connection.createChannel();
        }

        if (!connection || !channel) {
            throw new Error('Failed to create RabbitMQ connection or channel');
        }

        return { connection, channel };
    } catch (connectionError) {
        console.error('Error connecting to RabbitMQ:', connectionError);
        throw new Error('Failed to connect to RabbitMQ. Please check your connection settings.');
    }
}

async function listenToQueues() {
    try {
        const { channel } = await initializeRabbitMQ();
        await setupQueue(channel, QUEUES.ROUTINE_REGISTRATION);
        await setupQueue(channel, QUEUES.TEACHER_REGISTRATION);
        console.log(`Listening to multiple queues. To exit press CTRL+C`);
    } catch (error) {
        console.error('Error setting up queue listeners:', error);
        throw error;
    }
}

async function setupQueue(channel: Channel, queueName: string) {
    try {
        await channel.assertQueue(queueName, { durable: true });

        channel.consume(queueName, (msg: ConsumeMessage | null) => {
            if (msg !== null) {
                try {
                    const message = msg.content.toString();
                    console.log(`[${queueName}] Received message:`, message);
                    channel.ack(msg);
                } catch (messageError) {
                    console.error(`Error processing message from ${queueName}:`, messageError);
                    channel.nack(msg, false, false);
                }
            }
        }, { noAck: false });

        console.log(`Waiting for messages in ${queueName}.`);
    } catch (error) {
        console.error(`Error setting up queue ${queueName}:`, error);
        throw error;
    }
}

async function sendToQueue(queueName: string, message: any) {
    try {
        const { channel } = await initializeRabbitMQ();
        await channel.assertQueue(queueName, { durable: true });
        const messageBuffer = Buffer.from(JSON.stringify(message));
        const sent = channel.sendToQueue(queueName, messageBuffer, { persistent: true });
        console.log(`Message sent to ${queueName}:`, message);
        return sent;
    } catch (error) {
        console.error(`Error sending message to ${queueName}:`, error);
        throw error;
    }
}

export { listenToQueues, sendToQueue, QUEUES };
