import { rabbitMQ } from "./rabbitmq.client.js";

export async function registerQueue(queueName: string) {
  const channel = rabbitMQ.getChannel();
  const dlxName = `${queueName}.dlx`;
  const dlqName = `${queueName}.dlq`;
  const routingKey = `${queueName}.dlq`;
  try {
    await channel.assertExchange(dlxName, "direct", {
      durable: true,
    });

    await channel.assertQueue(dlqName, {
      durable: true,
    });
    await channel.bindQueue(dlqName, dlxName, routingKey);
    await channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": dlxName,
        "x-dead-letter-routing-key": routingKey,
      },
    });
  } catch (e) {
    console.log(e);
  }
}
