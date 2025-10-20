export interface WeatherData {
  current?: {
    temperature_2m: number;
    rain: number;
    precipitation: number;
    is_day: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  error?: string;
}