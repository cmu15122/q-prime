import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ToastContainer } from 'react-toastify';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { ThemeContextProvider, useThemeContext } from './contexts/ThemeContext';
import Home from './pages/home';
import Settings from './pages/settings';
import Metrics from './pages/metrics';
import StudentMetrics from './pages/studentMetrics';
import TAMetrics from './pages/taMetrics';
import Init from './pages/init';
import SqlQuery from './pages/sqlQuery';
import './App.css';

function AppContent() {
  const { theme } = useThemeContext();

  // check if a new semester has started and we need to make a new semester user
  const checkNewSemUser = useMutation(api.home.home_mutate.checkNewSemesterUser);
  const isFirstTimeSetup = useQuery(api.home.home_get.isFirstTimeSetup);

  // NOTE - the correct way to do these would be to use a post-auth callback check, but
  // I don't think this is supported by Convex Auth as of 1/1/2026.

  useEffect(() => {
    if (isFirstTimeSetup === false) {
      checkNewSemUser();
    }
  }, [isFirstTimeSetup]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <Router basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/metrics/student/:id" element={<StudentMetrics />} />
            <Route path="/metrics/ta/:id" element={<TAMetrics />} />
            <Route path="/init" element={<Init />} />
            <Route path="/sql" element={<SqlQuery />} />
          </Routes>
        </Router>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme.palette.mode}
          className=""
          toastStyle={{
            color: theme.palette.mode === 'light' ? '#000' : '#fff',
          }}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
}

export default App;
