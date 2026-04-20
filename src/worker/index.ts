import { connectMongoDB } from "../external/database/mongoDB.client.js";
import { rabbitMQ } from "../external/rabbitmq/rabbitmq.client.js";
import { helperClass } from "../utils/utils.js";
import { startVideoConsumer } from "../external/rabbitmq/consumer.js";

async function main() {
  await connectMongoDB();
  await helperClass.createDirectories();
  await rabbitMQ.connect();
  await startVideoConsumer();
  console.log("Video worker running");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
