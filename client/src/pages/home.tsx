import React from "react";
import { useTheme } from "@mui/material";

import Navbar from "../components/navbar/Navbar";
import HomeMain from "../components/home/HomeMain";
import { useQuery } from "convex/react";
import { Navigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api";

/**
 * Home page
 * @return {JSX.Element} Home page
 */
function Home() {
  const theme = useTheme();

  const firstTimeSetupRequired = useQuery(api.home.home_get.firstTimeSetupRequired);

  if (firstTimeSetupRequired) {
    return <Navigate to="/init" />;
  }

  return (
    <div
      className="App"
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <Navbar isHome={true} />
      <HomeMain />
    </div>
  );
}

export default Home;
