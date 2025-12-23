import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Settings from "./pages/settings";
import Metrics from "./pages/metrics";

import { darkTheme, lightTheme } from "./themes/base";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ThemeProvider } from "@mui/material";

import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ToastContainer } from "react-toastify";

import "./App.css";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import ConvexErrorWrapper from "./services/ConvexErrorWrapper";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () => (prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode],
  );
  const ThemeContext = React.createContext(theme);

  // check if a new semester has started and we need to make a new semester user
  const checkNewSemUser = useMutation(api.home.home_mutate.checkNewSemesterUser);

  // NOTE - the correct way to do these would be to use a post-auth callback check, but
  // I don't think this is supported by Convex Auth as of 1/1/2026.

  useEffect(() => {
    checkNewSemUser();
  }, []);


  return (
    <ThemeProvider theme={theme || darkTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeContext.Provider value={theme}>
          <ConvexErrorWrapper>
            <Router basename={process.env.PUBLIC_URL}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
              {/*<Route path='/metrics' element={<Metrics/>} />*/}
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
            />
          </ConvexErrorWrapper>
        </ThemeContext.Provider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
