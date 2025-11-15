import React, { useState, useEffect } from "react";

import SharedMain from "./shared/SharedMain";
import StudentMain from "./student/StudentMain";
import TAMain from "./ta/TAMain";
import Footer from "./Footer";
import { Container } from "@mui/material";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function HomeMain() {
  const gitHubLink = "https://github.com/cmu15122/q-issues/issues";

  const [mainPage, setMainPage] = useState<JSX.Element | null>(null);

  const userData = useQuery(api.home.home_get.getUserData);
  const isAuthenticated = userData !== null && userData !== undefined;
  const isTA = isAuthenticated && userData.user_kind === "TA";

  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
    } else if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (isTA) {
        setMainPage(<TAMain />);
      } else {
        // is student
        setMainPage(<StudentMain />);
      }
    } else {
      // you are not logged in
      setMainPage(null);
    }
  }, [isAuthenticated, isTA]);

  return (
    <Container
      sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}
    >
      <SharedMain />
      {mainPage}
      <Footer gitHubLink={gitHubLink} />
    </Container>
  );
}

export default HomeMain;
