import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ToastContainer } from 'react-toastify';
import { ThemeContextProvider, useThemeContext } from './contexts/ThemeContext';
import CourseScope from './contexts/CourseContext';
import CourseListPage from './pages/CourseListPage';
import CreateCoursePage from './pages/CreateCoursePage';
import Home from './pages/home';
import Settings from './pages/settings';
import Metrics from './pages/metrics';
import StudentMetrics from './pages/studentMetrics';
import TAMetrics from './pages/taMetrics';
import './App.css';

function AppContent() {
  const { theme } = useThemeContext();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <Router basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<CourseListPage />} />
            <Route path="/create" element={<CreateCoursePage />} />
            <Route path="/:classSlug" element={<CourseScope />}>
              <Route index element={<Home />} />
              <Route path="ohq" element={<Home />} />
              <Route path="settings" element={<Settings />} />
              <Route path="metrics" element={<Metrics />} />
              <Route path="metrics/student/:id" element={<StudentMetrics />} />
              <Route path="metrics/ta/:id" element={<TAMetrics />} />
            </Route>
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
