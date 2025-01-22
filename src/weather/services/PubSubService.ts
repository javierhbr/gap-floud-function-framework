import { PubSub } from '@google-cloud/pubsub';
import { PubSubServicePort, WeatherData } from '../types';

export class PubSubService implements PubSubServicePort {
  constructor(
    private readonly pubsub: PubSub,
    private readonly topicName: string
  ) {}

  async publishHighTemperature(data: WeatherData): Promise<void> {
    const topic = this.pubsub.topic(this.topicName);
    const message = JSON.stringify(data);
    await topic.publish(Buffer.from(message));
  }
}
