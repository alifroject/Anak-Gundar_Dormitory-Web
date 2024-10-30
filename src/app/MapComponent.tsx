import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
});

interface TransformedKostanData {
    id: string;
    nama: string;
    geolokasi: {
        latitude: number;
        longitude: number;
    };
}

interface MapComponentProps {
    kostanData: TransformedKostanData[];
}

const MapComponent: React.FC<MapComponentProps> = ({ kostanData }) => {
    const map = useMap();

    useEffect(() => {
        console.log("Data Kostan:", kostanData); // Log data kostan

        if (kostanData.length > 0) {
            const bounds = L.latLngBounds(kostanData.map(kostan => [
                kostan.geolokasi.latitude,
                kostan.geolokasi.longitude,
            ]));
            map.fitBounds(bounds);
        }
    }, [kostanData, map]);

    return (
        <>
            {kostanData.map((kostan) => (
                <Marker 
                    key={kostan.id} 
                    position={[kostan.geolokasi.latitude, kostan.geolokasi.longitude] as [number, number]}
                    icon={customIcon}
                >
                    <Popup>{kostan.nama}</Popup>
                </Marker>
            ))}
        </>
    );
};

const MapWrapper: React.FC<{ kostanData: TransformedKostanData[] }> = ({ kostanData }) => {
    const initialPosition: [number, number] = [-7.7956, 110.4165]; // Contoh posisi awal yang lebih relevan

    return (
        <MapContainer center={initialPosition} zoom={10} style={{ height: "400px", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" // Sumber tile alternatif
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapComponent kostanData={kostanData} />
        </MapContainer>
    );
};

export default MapWrapper;
