import { useEffect, useState } from "react";
import type { GeoLocation } from "../models/GeoLocation";
import { fetchWeatherApi } from "openmeteo";

//
import sunny from "../assets/sunny-bg.jpg";
import rainny from "../assets/rainny-bg.jpg";
import cloudy from "../assets/cloudy-bg.jpg";

import type { WeatherData } from "../models/WeatherData";

export default function Home() {
  const [geoLocation, setGeolocation] = useState<GeoLocation>({
    lat: null,
    lon: null,
    error: null,
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [bgImage, setBgImage] = useState<string>("");

  useEffect(() => {
    const images = [sunny, rainny, cloudy];
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeolocation({
        lat: null,
        lon: null,
        error: "Geolocation is not supported by your browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          error: null,
        });
      },
      (err) => {
        setGeolocation({
          lat: null,
          lon: null,
          error: err.message,
        });
      }
    );
  }, []);

  // Fetch weather when coordinates are available
  useEffect(() => {
    const getWeather = async () => {
      if (!geoLocation.lat || !geoLocation.lon) return;

      try {
        const params = {
          latitude: geoLocation.lat,
          longitude: geoLocation.lon,
          current: [
            "temperature_2m",
            "rain",
            "precipitation",
            "is_day",
            "wind_speed_10m",
            "weather_code",
          ],
        };

        const url = "https://api.open-meteo.com/v1/forecast";
        const responses = await fetchWeatherApi(url, params);
        const response = responses[0];
        const current = response.current()!;

        const data: WeatherData = {
          current: {
            temperature_2m: current.variables(0)!.value(),
            rain: current.variables(1)!.value(),
            precipitation: current.variables(2)!.value(),
            is_day: current.variables(3)!.value(),
            wind_speed_10m: current.variables(4)!.value(),
            weather_code: current.variables(5)!.value(),
          },
        };

        setWeather(data);
      } catch (err) {
        setWeather({ error: "Failed to fetch weather data." });
      }
    };

    getWeather();
  }, [geoLocation.lat, geoLocation.lon]);

  useEffect(() => {
    if (!weather?.current) return;

    const code = weather.current.weather_code;

    if ([0, 1].includes(code)) setBgImage(sunny);
    else if ([2, 3, 45, 48].includes(code)) setBgImage(cloudy);
    else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
      setBgImage(rainny);
    else setBgImage(cloudy);
  }, [weather]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-6 transition-all duration-700"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
      }}
    >
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center text-white">
        <h1 className="text-2xl font-bold mb-6 tracking-wide drop-shadow-lg">
          🌦️ Weather Dashboard
        </h1>

        {geoLocation.error ? (
          <p className="text-red-300">{geoLocation.error}</p>
        ) : geoLocation.lat && geoLocation.lon ? (
          <>
            <p className="text-white/80 mb-4">
              🌍 Latitude: {geoLocation.lat.toFixed(3)}, Longitude:{" "}
              {geoLocation.lon.toFixed(3)}
            </p>

            {weather ? (
              weather.error ? (
                <p className="text-red-300">{weather.error}</p>
              ) : weather.current ? (
                <div className="grid gap-3 mt-4">
                  <div className="bg-white/10 rounded-xl py-3 backdrop-blur-sm hover:bg-white/20 transition-transform transform hover:scale-105">
                    <p className="text-2xl font-semibold">
                      🌡️ {weather.current.temperature_2m.toFixed(1)}°C
                    </p>
                    <p className="text-sm text-white/70">Temperature</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-xl py-3 hover:bg-white/20 transition-all">
                      <p className="text-lg font-semibold">
                        💧 {weather.current.rain.toFixed(1)} in
                      </p>
                      <p className="text-sm text-white/70">Rain</p>
                    </div>
                    <div className="bg-white/10 rounded-xl py-3 hover:bg-white/20 transition-all">
                      <p className="text-lg font-semibold">
                        ☁️ {weather.current.precipitation.toFixed(1)} in
                      </p>
                      <p className="text-sm text-white/70">Precipitation</p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl py-3">
                    <p className="text-lg font-semibold">
                      {weather.current.is_day ? "🌞 Daytime" : "🌙 Nighttime"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-xl py-3 hover:bg-white/20 transition-all">
                      <p className="text-lg font-semibold">
                        🌬️ {weather.current.wind_speed_10m.toFixed(1)} m/s
                      </p>
                      <p className="text-sm text-white/70">Wind Speed</p>
                    </div>
                    <div className="bg-white/10 rounded-xl py-3 hover:bg-white/20 transition-all">
                      <p className="text-lg font-semibold">
                        🌤️ {weather.current.weather_code}
                      </p>
                      <p className="text-sm text-white/70">Weather Code</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/80 mt-6">Loading weather data...</p>
              )
            ) : (
              <p className="text-white/80 mt-6">Fetching weather...</p>
            )}
          </>
        ) : (
          <p className="text-white/80 mt-6">Detecting location...</p>
        )}
      </div>
    </div>
  );
}
