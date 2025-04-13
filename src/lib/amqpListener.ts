import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

async function listenToQueue() {
    const username = process.env.RABBITMQ_USERNAME || 'guest';
    const password = process.env.RABBITMQ_PASSWORD || 'guest';
    const host = process.env.RABBITMQ_HOST || 'localhost';
    const port = 5672;
    const queue = 'teacher_registration_queue';

    try {
        console.debug('Attempting to connect to RabbitMQ server over AMQPS...');
        
        // Construct the connection URL
        const connection = await amqp.connect({
            protocol: 'amqps',
            hostname: host,
            port: port,
            username: username,
            password: password
        });
        console.debug('Successfully connected to RabbitMQ server over AMQPS.');

        const channel = await connection.createChannel();
        console.debug('Channel created successfully.');

        console.debug(`Asserting queue: ${queue}`);
        await channel.assertQueue(queue, { durable: true });
        console.debug(`Queue ${queue} asserted successfully.`);

        console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const message = msg.content.toString();
                console.debug('Message received:', message);

                console.log('Received message:', message);

                console.debug('Acknowledging message...');
                channel.ack(msg);
                console.debug('Message acknowledged.');
            } else {
                console.debug('Received null message.');
            }
        }, { noAck: false });
    } catch (error) {
        console.error('Error:', error);
    }
}

export { listenToQueue };
