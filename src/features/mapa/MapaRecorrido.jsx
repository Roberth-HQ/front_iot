import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useProjectStore } from '../../store/projectStore';
import api from '../../api/axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, Clock, ChevronRight, Calendar } from 'lucide-react';
import './MapaRecorrido.css';

const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const ChangeView = ({ center }) => {
  const map = useMap();
  if (center) map.setView(center, map.getZoom(), { animate: true });
  return null;
};

const MapaRecorrido = () => {
  const { selectedProjectId } = useProjectStore();
  const [allData, setAllData] = useState([]); // Guardamos todo lo que viene del back
  const [selectedDate, setSelectedDate] = useState(''); // Día seleccionado
  const [loading, setLoading] = useState(true);
  const [activePoint, setActivePoint] = useState(null);

  const fetchGPSData = async () => {
    if (!selectedProjectId) return;
    try {
      setLoading(true);
      const res = await api.get(`/readings/gps/${selectedProjectId}`);
      setAllData(res.data);

      // Al cargar por primera vez, seleccionamos el día más reciente
      if (res.data.length > 0) {
        const lastDate = new Date(res.data[0].timestamp).toISOString().split('T')[0];
        setSelectedDate(lastDate);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE FILTRADO Y PROCESAMIENTO ---
  // Obtenemos la lista de días únicos que tienen registros
  const availableDates = useMemo(() => {
    const dates = allData.map(item => new Date(item.timestamp).toISOString().split('T')[0]);
    return [...new Set(dates)].sort((a, b) => b.localeCompare(a)); // De más reciente a más antiguo
  }, [allData]);

  // Procesamos los puntos solo del día seleccionado
  const { dailyPath, dailyHistory } = useMemo(() => {
    if (!selectedDate) return { dailyPath: [], dailyHistory: [] };

    const coordsMap = new Map();
    allData
      .filter(item => new Date(item.timestamp).toISOString().split('T')[0] === selectedDate)
      .forEach(item => {
        const secondKey = new Date(item.timestamp).toISOString().substring(0, 19);
        if (!coordsMap.has(secondKey)) {
          coordsMap.set(secondKey, { time: secondKey, lat: null, lng: null });
        }
        const entry = coordsMap.get(secondKey);
        if (item.sensor.type === 'lat') entry.lat = item.value;
        if (item.sensor.type === 'lng') entry.lng = item.value;
      });

    const path = [];
    const history = [];
    const sortedKeys = Array.from(coordsMap.keys()).sort((a, b) => b.localeCompare(a));

    sortedKeys.forEach(key => {
      const data = coordsMap.get(key);
      if (data.lat !== null && data.lng !== null) {
        const pos = [data.lat, data.lng];
        path.push(pos);
        history.push({
          position: pos,
          displayTime: new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        });
      }
    });

    return { dailyPath: path, dailyHistory: history };
  }, [allData, selectedDate]);

  useEffect(() => {
    fetchGPSData();
  }, [selectedProjectId]);

  // Actualizar el punto activo cuando cambias de día
  useEffect(() => {
    if (dailyPath.length > 0) setActivePoint(dailyPath[0]);
  }, [dailyPath]);

  return (
    <div className="gps-layout">
      <aside className="gps-sidebar">
        <div className="sidebar-header">
          <Calendar size={20} color="#ef4444" />
          <select 
            className="date-selector"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            {availableDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>

        <div className="timeline-list">
          {dailyHistory.map((item, idx) => (
            <div 
              key={idx} 
              className={`timeline-card ${activePoint === item.position ? 'active' : ''}`}
              onClick={() => setActivePoint(item.position)}
            >
              <div className="time-tag">{item.displayTime}</div>
              <div className="info">
                <span>Registro GPS</span>
                <small>Ver ubicación exacta</small>
              </div>
              <ChevronRight size={16} />
            </div>
          ))}
        </div>
      </aside>

      <main className="map-frame">
        <MapContainer center={activePoint || [-16.4789, -68.1421]} zoom={17} className="leaflet-container">
          <ChangeView center={activePoint} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {dailyPath.length > 0 && (
            <>
              <Polyline positions={dailyPath} color="#ef4444" weight={7} opacity={0.7} lineCap="round" />
              <Marker position={dailyPath[0]} icon={truckIcon}>
                <Popup><b>Camión</b><br/>{dailyHistory[0]?.displayTime}</Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </main>
    </div>
  );
};

export default MapaRecorrido;