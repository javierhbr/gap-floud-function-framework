import { Firestore } from '@google-cloud/firestore';
import { WeatherServicePort, WeatherData } from '../types';

export class WeatherService implements WeatherServicePort {
  private readonly collection = 'weather';

  constructor(private readonly firestore: Firestore) {}

  async getWeatherByDate(date: string): Promise<WeatherData[]> {
    const snapshot = await this.firestore
      .collection(this.collection)
      .where('date', '==', date)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WeatherData[];
  }

  async saveWeather(data: WeatherData): Promise<string> {
    const docRef = await this.firestore.collection(this.collection).add(data);
    return docRef.id;
  }

  async updateWeather(id: string, data: Partial<WeatherData>): Promise<void> {
    await this.firestore.collection(this.collection).doc(id).update(data);
  }

  async getWeatherById(id: string): Promise<WeatherData> {
    const doc = await this.firestore.collection(this.collection).doc(id).get();

    if (!doc.exists) {
      throw new Error('Weather data not found');
    }

    return { id: doc.id, ...doc.data() } as WeatherData;
  }
}
