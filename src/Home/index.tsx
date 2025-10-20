import { useEffect, useState } from "react";
import type { GeoLocation } from "../models/GeoLocation";

export default function Home(){

    const[geoLocation, setGeolocation] = useState<GeoLocation>({
        lat: null,
        lon:null,
        error: null
    })

     useEffect(() => {
    if (!navigator.geolocation) {
      setGeolocation({
        lat: null,
        lon: null,
        error: 'Geolocation is not supported by your browser.',
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
        //logic to get the climate using lat and lon
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

    return(
        <div className="dash-board">
                {geoLocation.error ? (
                    <p>Error: {geoLocation.error}</p>
                ) : geoLocation.lat && geoLocation.lon ? (
                    <p>
                    Latitude: {geoLocation.lat}, Longitude: {geoLocation.lon}
                    </p>
                ) : null}
        </div>
    );
}