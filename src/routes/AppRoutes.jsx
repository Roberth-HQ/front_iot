import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardLayout from '../layouts/DashboardLayout';
import DispositivosPage from '../features/dashboard/pages/DispositivosPage';
import ProyectosPage from '../features/projects/pages/ProyectosPage';
import LocationsPage from '../features/location/LocationsPage';
import DevicesPage from '../features/devices/DevicesPages';
import SensorDetailPage from '../features/sensors/SensorDetailPage';

export const AppRoutes = () => {
  // 1. IMPORTANTE: Extraemos isAuthenticated CORRECTAMENTE
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Log para ver qué está pasando en tiempo real
  console.log("PORTERO: ¿Usuario autenticado?", isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA */}
        <Route path="/login" element={<LoginPage />} />

        {/* RUTAS PROTEGIDAS ANIDADAS */}
        {isAuthenticated ? (
          <Route path="/" element={<DashboardLayout />}>
            {/* Si entras a "/", te manda a "/dashboard" */}
            <Route index element={<Navigate to="dashboard" />} />
            {/* Esta es la página hija que se verá en el Outlet */}
            <Route path="dashboard" element={<div><h1>¡DASHBOARD ACTIVO! 🚀</h1></div>} />
            <Route path="dispositivos" element={<DispositivosPage />} />
            <Route path='proyectos' element={<ProyectosPage/>}/>
            <Route path="/proyectos/:projectId/locations" element={<LocationsPage />} />
            <Route path="/location/:locationId/devices" element={<DevicesPage />} />
            <Route path="/sensor/:sensorId" element={<SensorDetailPage />} />
          </Route>

          
        ) : (
          /* Si NO estás logueado, cualquier otra ruta te manda al login */
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};