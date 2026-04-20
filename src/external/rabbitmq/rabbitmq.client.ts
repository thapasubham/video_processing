import amqp from "amqplib";
import { config } from "../../utils/config.js";

class RabbitMQ {
  private channel!: amqp.Channel;

  async connect() {
    try {
      const connection = await amqp.connect(config.RABBITMQ_URL);
      this.channel = await connection.createChannel();
      console.log("RabbitMQ connected");
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  getChannel() {
    if (!this.channel) {
      throw new Error("RabbitMQ not connected yet");
    }
    return this.channel;
  }
}

export const rabbitMQ = new RabbitMQ();
