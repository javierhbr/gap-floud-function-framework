import { WeatherServicePort, WeatherApiPort } from './types';

export class WeatherValidation {
  constructor(
    private readonly weatherService: WeatherServicePort,
    private readonly weatherApi: WeatherApiPort
  ) {}

  async checkByDate(date: string): Promise<boolean> {
    const [dbData, apiData] = await Promise.all([
      this.weatherService.getWeatherByDate(date),
      this.weatherApi.fetchWeatherData(date),
    ]);

    // Compare data from both sources
    const dbTemp = dbData[0]?.temperature;
    const apiTemp = apiData.temperature;

    // Allow 5 degree difference
    return !dbTemp || !apiTemp || Math.abs(dbTemp - apiTemp) <= 5;
  }
}
