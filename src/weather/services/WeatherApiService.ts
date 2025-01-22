import { WeatherApiPort, WeatherApiResponse } from '../types';
import axios from 'axios';

export class WeatherApiService implements WeatherApiPort {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string
  ) {}

  async fetchWeatherData(date: string): Promise<WeatherApiResponse> {
    const response = await axios.get(`${this.baseUrl}/weather`, {
      params: { date, apiKey: this.apiKey },
    });

    return {
      temperature: response.data.temperature,
      humidity: response.data.humidity,
    };
  }
}
