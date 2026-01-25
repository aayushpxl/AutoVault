import React, { useEffect, useState, useRef } from "react";
import { MdLocationOn, MdCalendarToday } from "react-icons/md";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationPicker({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function LocationDate() {
  const [position, setPosition] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [locationText, setLocationText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const dateInputRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setLocationText(`${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`);
      },
      (err) => {
        console.error("Geolocation error:", err);
      }
    );
  }, []);

  useEffect(() => {
    if (position) {
      setLocationText(`${position[0].toFixed(5)}, ${position[1].toFixed(5)}`);
    }
  }, [position]);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[480px] bg-white shadow-premium rounded-2xl flex flex-col sm:flex-row items-center px-8 py-6 gap-6 sm:gap-8 w-[90%] sm:w-[70%] max-w-4xl z-20 border border-slate-200 animate-fadeInUp">
      {/* Location */}
      <div className="flex items-center gap-3 w-full relative">
        <div className="flex-shrink-0">
          <MdLocationOn
            className="text-secondary text-2xl cursor-pointer hover:scale-110 transition-transform duration-300"
            onClick={() => setShowMap((prev) => !prev)}
          />
        </div>
        <div className="flex flex-col text-sm w-full">
          <span className="font-semibold text-dark mb-1">Location</span>
          <input
            type="text"
            value={locationText}
            placeholder="Find your location"
            readOnly
            className="outline-none bg-transparent text-gray-600 placeholder:text-sm placeholder:text-gray-400"
          />
        </div>

        {/* Map popup */}
        {showMap && (
          <div className="absolute top-16 left-0 w-[320px] h-[240px] z-50 border-2 border-accent rounded-xl overflow-hidden shadow-premium">
            <MapContainer
              center={position || [51.505, -0.09]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {position && <Marker position={position} />}
              <LocationPicker setPosition={setPosition} />
            </MapContainer>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-12 bg-slate-300"></div>

      {/* Date Picker */}
      <div className="flex items-center gap-3 w-full relative">
        <div className="flex-shrink-0">
          <MdCalendarToday
            className="text-secondary text-2xl cursor-pointer hover:scale-110 transition-transform duration-300"
            onClick={() => dateInputRef.current?.showPicker()}
          />
        </div>
        <div className="flex flex-col text-sm w-full">
          <span className="font-semibold text-dark mb-1">Select Date</span>
          <span className="text-gray-600">
            {selectedDate ? selectedDate : "No date selected"}
          </span>
        </div>
        {/* Hidden native input to trigger date picker */}
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="absolute opacity-0 pointer-events-none"
        />
      </div>

      {/* Button */}
      <button className="bg-gradient-secondary hover:shadow-glow-orange text-white px-10 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex-shrink-0">
        Search
      </button>
    </div>
  );
}
