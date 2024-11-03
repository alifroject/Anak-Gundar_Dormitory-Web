import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
});

interface Geolocation {
    latitude: number;
    longitude: number;
}

interface TransformedKostanData {
    nama: string;
    geolokasi: Geolocation;
}

interface MapComponentProps {
    kostanData: TransformedKostanData[];
    hideXAxis?: boolean; // Optional prop to hide the x-axis
}

const MapComponent: React.FC<MapComponentProps> = ({ kostanData, hideXAxis }) => {
    const map = useMap();

    useEffect(() => {
        if (kostanData.length > 0) {
            const bounds = L.latLngBounds(
                kostanData.map(kostan => [
                    kostan.geolokasi.latitude,
                    kostan.geolokasi.longitude,
                ])
            );

            // Tunggu peta siap sebelum memanggil fitBounds
            map.whenReady(() => {
                map.fitBounds(bounds, { padding: [10, 10] }); // Sesuaikan padding
            });
        }
    }, [kostanData, map]);

    if (kostanData.length === 0) return null;

    return (
        <>
            {!hideXAxis && (
                <div className="x-axis"> {/* Render x-axis here if hideXAxis is false */} 
                    {/* Implement your x-axis rendering logic here */}
                </div>
            )}
            {kostanData.map(({ nama, geolokasi }, index) => (
                <Marker
                    key={index} // Pastikan key unik
                    position={[geolokasi.latitude, geolokasi.longitude]}
                    icon={customIcon}
                >
                    <Popup>{nama}</Popup>
                </Marker>
            ))}
        </>
    );
};

const MapWrapper: React.FC<{ kostanData: TransformedKostanData[]; hideXAxis?: boolean }> = ({ kostanData, hideXAxis }) => {
    const initialPosition: [number, number] = [51.505, -0.09]; // Ganti dengan koordinat yang sesuai jika perlu

    return (
        <MapContainer 
            center={initialPosition} 
            zoom={13} 
            scrollWheelZoom={true} // Mengizinkan zoom dengan scroll
            style={{ height: '100%', width: '100%' }} 
            zoomControl={true} // Menampilkan kontrol zoom
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapComponent kostanData={kostanData} hideXAxis={hideXAxis} />
        </MapContainer>
    );
};

export default MapWrapper;
