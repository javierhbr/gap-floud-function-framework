export interface WeatherData {
  id: string;
  temperature: number;
  humidity: number;
  date: string;
  location: string;
}

export interface WeatherApiResponse {
  temperature: number;
  humidity: number;
}

export interface WeatherServicePort {
  getWeatherByDate(date: string): Promise<WeatherData[]>;
  saveWeather(data: WeatherData): Promise<string>;
  updateWeather(id: string, data: Partial<WeatherData>): Promise<void>;
  getWeatherById(id: string): Promise<WeatherData>;
}

export interface WeatherApiPort {
  fetchWeatherData(date: string): Promise<WeatherApiResponse>;
}

export interface PubSubServicePort {
  publishHighTemperature(data: WeatherData): Promise<void>;
}
