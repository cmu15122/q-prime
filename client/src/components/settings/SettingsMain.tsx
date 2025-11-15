import React from "react";
import { CircularProgress, Typography } from "@mui/material";

import AdminMain from "./admin/AdminMain";
import VideoChatSettings from "./VideoChatSettings";
import NotificationSettings from "./NotificationSettings";
import TimerSettings from "./TimerSettings";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function Main() {
  const userData = useQuery(api.home.home_get.getUserData);
  const isLoadingUserData = userData === undefined;
  const isAuthenticated = userData !== null && userData !== undefined;

  return isLoadingUserData ? (
    <CircularProgress />
  ) : isAuthenticated ? (
    <div>
      <Typography
        variant="h3"
        textAlign="center"
        sx={{ mt: 4, mb: 2 }}
        fontWeight="bold"
      >
        Settings
      </Typography>
      {!userData.is_owner && <VideoChatSettings />}
      {!userData.is_owner && <NotificationSettings />}
      {!userData.is_owner && <TimerSettings />}

      {userData.ta_data!.is_admin && <AdminMain />}
    </div>
  ) : (
    <div></div>
  );
}

export default Main;
