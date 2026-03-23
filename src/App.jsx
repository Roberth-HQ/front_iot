import { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { useThemeStore } from './store/themeStore';
function App() {
  const isDarkMode = useThemeStore((state)=> state.isDarkMode); 
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', isDarkMode? 'dark':'light');
  },[isDarkMode]);
  return (
    <AppRoutes />
  );
}
export default App;