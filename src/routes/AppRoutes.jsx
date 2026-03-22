import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { useAuthStore } from '../context/authStore';
// import LoginPage from '../features/auth/pages/LoginPage';
// import DashboardLayout from '../layouts/DashboardLayout';

// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   // Si no está autenticado, lo mandamos al login
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

export const AppRoutes = () => {
  const isAuthenticated =true;

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA 1: El Login (Siempre accesible si no estás logueado) */}
        <Route path="/login" element={<h1>Página de Login (Próximamente)</h1>} />

        {/* RUTA 2: El Dashboard (Solo debería verse si isAuthenticated es true) */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <h1>¡Bienvenido al Dashboard de IoT!</h1>
            ) : (
              <Navigate to="/login" /> // Si no tiene llave, lo mandamos al login
            )
          } 
        />

        {/* RUTA 3: Comodín (Si escriben cualquier otra cosa, al login) */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
  // return (
  //   <BrowserRouter>
  //     <Routes>
  //       {/* RUTA PÚBLICA: El Login siempre debe estar disponible */}
  //       <Route path="/login" element={<LoginPage />} />

  //       {/* RUTAS PROTEGIDAS: Solo si hay usuario logueado */}
  //       <Route 
  //         path="/" 
  //         element={
  //           <ProtectedRoute>
  //             <DashboardLayout />
  //           </ProtectedRoute>
  //         }
  //       >
  //         {/* Esta es la ruta por defecto dentro del dashboard */}
  //         <Route index element={<Navigate to="/dashboard" replace />} />
  //         <Route path="dashboard" element={<div>Hola, soy el Dashboard</div>} />
  //         <Route path="proyectos" element={<div>Página de Proyectos</div>} />
  //       </Route>

  //       {/* Si escriben cualquier otra cosa, al login */}
  //       <Route path="*" element={<Navigate to="/login" replace />} />
  //     </Routes>
  //   </BrowserRouter>
  // );
};