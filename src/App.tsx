import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CircularProgress, ThemeProvider, CssBaseline } from '@mui/material';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ToastContainer } from 'react-toastify';
import { ThemeContextProvider, useThemeContext } from './contexts/ThemeContext';
import CourseScope from './contexts/CourseContext';
import './themes/global.css';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const CreateCoursePage = lazy(() => import('./pages/CreateCoursePage'));
const SingleCourseRoot = lazy(() => import('./pages/SingleCourseRoot'));
const SingleCourseCreateGuard = lazy(() => import('./pages/SingleCourseCreateGuard'));
const Home = lazy(() => import('./pages/home'));
const Settings = lazy(() => import('./pages/settings'));
const Metrics = lazy(() => import('./pages/metrics'));
const StudentMetrics = lazy(() => import('./pages/studentMetrics'));
const TAMetrics = lazy(() => import('./pages/taMetrics'));

const SINGLE_COURSE = import.meta.env.VITE_SINGLE_COURSE_MODE === 'true';

function RouteFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function AppContent() {
  const { theme } = useThemeContext();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <Router basename={import.meta.env.BASE_URL}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={SINGLE_COURSE ? <SingleCourseRoot /> : <LandingPage />} />
              <Route path="/create" element={SINGLE_COURSE ? <SingleCourseCreateGuard /> : <CreateCoursePage />} />
              <Route path="/:classSlug" element={<CourseScope />}>
                <Route index element={<Home />} />
                <Route path="ohq" element={<Home />} />
                <Route path="settings" element={<Settings />} />
                <Route path="metrics" element={<Metrics />} />
                <Route path="metrics/student/:id" element={<StudentMetrics />} />
                <Route path="metrics/ta/:id" element={<TAMetrics />} />
              </Route>
            </Routes>
          </Suspense>
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
