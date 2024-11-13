import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FeatureCollection, Geometry } from 'geojson';

interface GeoJSONFeatureProperties {
    name: string;
}

interface KosList {
    id: string;
    name: string;
    geolokasi: {
        lat: number;
        lng: number;
    };
    address: {
        jalan: string;
        kota_kabupaten: string;
        provinsi: string;
    };
    price: {
        perHari: number;
        perMinggu: number;
        perBulan: number;
    };
    images: string[];
    region: string;
    fal: {
        [key: string]: boolean;
    };
}

interface Props {
    kosList: KosList[];
    onSelectKos: (kos: KosList) => void;
}

const geojsonData: FeatureCollection<Geometry, GeoJSONFeatureProperties> = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [106.45, -6.5], // Kiri bawah
                        [107.15, -6.5], // Kanan bawah
                        [107.15, -6.0], // Kanan atas
                        [106.45, -6.0], // Kiri atas
                        [106.45, -6.5], // Menutup kotak
                    ],
                ],
            },
            properties: {
                name: "Jabodetabek Area (Larger)",
            },
        },
    ],
};

const KosMap: React.FC<Props> = ({ kosList, onSelectKos }) => {
    const [icon, setIcon] = useState<L.Icon | null>(null);
    const [, setSelectedKos] = useState<KosList | null>(null);  // State untuk marker yang dipilih

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const customIcon = new L.Icon({
                iconUrl: '/marker-icon.png',
                iconSize: [45, 61],
                iconAnchor: [32, 61],
            });
            setIcon(customIcon);
        }
    }, []);

    if (!icon) return <p>Loading map...</p>;

    const handleMarkerClick = (kos: KosList) => {
        setSelectedKos(kos); // Set the selectedKos state when a marker is clicked
        onSelectKos(kos); // Trigger onSelectKos callback
    };

    return (
        <MapContainer
            className="w-full h-[400px] md:h-[90vh] z-0" // Ensure map takes full viewport height
            center={[-6.200000, 106.816666]}
            zoom={11}
            scrollWheelZoom={true}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />

            {/* Render Kos markers */}
            {kosList.map((kos) => (
                <Marker
                    key={kos.id}
                    position={[kos.geolokasi.lat, kos.geolokasi.lng]}
                    icon={icon}
                    eventHandlers={{
                        click: () => handleMarkerClick(kos),
                    }}
                >
                    <Popup>
                        <div className='w-[140px]'>
                            <strong>{kos.name}</strong>
                            <br />
                            Jl. {kos.address.jalan}, Kota/Kabupaten. {kos.address.kota_kabupaten}, Provinsi. {kos.address.provinsi}
                            
                            <p>
                                Harga per Bulan: <span className="font-semibold text-green-600">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(kos.price.perBulan)}
                                </span>
                            </p>

                            <br />
                            <img src={kos.images[0]} alt="Gambar Kos" width="100%" />
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Render GeoJSON features */}
            <GeoJSON data={geojsonData} />
        </MapContainer>
    );
};

export default KosMap;
