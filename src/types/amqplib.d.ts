declare module 'amqplib' {
  export interface Connection {
    createChannel(): Promise<Channel>;
    close(): Promise<void>;
    serverProperties: any;
    expectSocketClose: boolean;
    sentSinceLastCheck: number;
    recvSinceLastCheck: number;
    sendMessage: Function;
  }

  export interface Channel {
    assertQueue(queue: string, options?: AssertQueueOptions): Promise<QueueOk>;
    consume(queue: string, onMessage: (msg: ConsumeMessage | null) => void, options?: ConsumeOptions): Promise<Consume>;
    sendToQueue(queue: string, content: Buffer, options?: Options.Publish): boolean;
    ack(message: ConsumeMessage, allUpTo?: boolean): void;
    nack(message: ConsumeMessage, allUpTo?: boolean, requeue?: boolean): void;
    prefetch(count: number, global?: boolean): Promise<void>;
    close(): Promise<void>;
  }

  export interface AssertQueueOptions {
    exclusive?: boolean;
    durable?: boolean;
    autoDelete?: boolean;
    arguments?: any;
    messageTtl?: number;
    expires?: number;
    deadLetterExchange?: string;
    deadLetterRoutingKey?: string;
    maxLength?: number;
    maxPriority?: number;
  }

  export interface QueueOk {
    queue: string;
    messageCount: number;
    consumerCount: number;
  }

  export interface ConsumeOptions {
    consumerTag?: string;
    noLocal?: boolean;
    noAck?: boolean;
    exclusive?: boolean;
    priority?: number;
    arguments?: any;
  }

  export interface ConsumeMessage {
    content: Buffer;
    fields: Fields;
    properties: Properties;
  }

  export interface Fields {
    consumerTag: string;
    deliveryTag: number;
    redelivered: boolean;
    exchange: string;
    routingKey: string;
  }

  export interface Properties {
    contentType?: string;
    contentEncoding?: string;
    headers?: any;
    deliveryMode?: number;
    priority?: number;
    correlationId?: string;
    replyTo?: string;
    expiration?: string;
    messageId?: string;
    timestamp?: number;
    type?: string;
    userId?: string;
    appId?: string;
    clusterId?: string;
  }

  export interface Consume {
    consumerTag: string;
  }

  export namespace Options {
    export interface Publish {
      expiration?: string | number;
      userId?: string;
      priority?: number;
      persistent?: boolean;
      deliveryMode?: number;
      mandatory?: boolean;
      contentType?: string;
      contentEncoding?: string;
      headers?: any;
      correlationId?: string;
      replyTo?: string;
      messageId?: string;
      timestamp?: number;
      type?: string;
      appId?: string;
    }
  }

  export function connect(url: string | object): Promise<Connection>;
}