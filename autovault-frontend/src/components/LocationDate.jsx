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
    <div className="bg-white shadow-2xl rounded-2xl flex flex-col md:flex-row items-center px-6 py-5 gap-4 md:gap-0 w-full max-w-5xl z-10 border border-gray-100 mx-auto transform translate-y-10 lg:translate-y-16">

      {/* Location Input */}
      <div className="flex-1 flex items-center gap-4 px-4 w-full md:border-r border-gray-200">
        <div className="bg-blue-50 p-3 rounded-full text-secondary">
          <MdLocationOn size={24} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => setShowMap(!showMap)} />
        </div>
        <div className="flex flex-col w-full relative">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</label>
          <input
            type="text"
            value={locationText}
            placeholder="Where are you going?"
            readOnly
            className="outline-none bg-transparent text-gray-800 font-medium placeholder-gray-400 w-full cursor-pointer"
            onClick={() => setShowMap(!showMap)}
          />

          {/* Map Popup attached to Location section */}
          {showMap && (
            <div className="absolute top-14 left-0 w-72 h-64 z-50 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fadeIn">
              <MapContainer center={position || [51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {position && <Marker position={position} />}
                <LocationPicker setPosition={setPosition} />
              </MapContainer>
            </div>
          )}
        </div>
      </div>

      {/* Date Picker */}
      <div className="flex-1 flex items-center gap-4 px-4 w-full md:border-r border-gray-200 mt-4 md:mt-0">
        <div className="bg-orange-50 p-3 rounded-full text-secondary">
          <MdCalendarToday size={22} className="cursor-pointer" onClick={() => dateInputRef.current?.showPicker()} />
        </div>
        <div className="flex flex-col w-full">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pick-up Date</label>
          <div
            className="text-gray-800 font-medium cursor-pointer"
            onClick={() => dateInputRef.current?.showPicker()}
          >
            {selectedDate || "Select Date"}
          </div>
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="absolute opacity-0 pointer-events-none"
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="px-4 mt-4 md:mt-0 w-full md:w-auto">
        <button className="bg-secondary hover:bg-secondary/90 text-white h-14 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto flex items-center justify-center gap-2">
          Find Cars
        </button>
      </div>
    </div>
  );
}
