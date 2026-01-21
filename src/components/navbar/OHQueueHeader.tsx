import React from "react";
import { Link, useTheme } from "@mui/material";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function OHQueueHeader() {
  const queueData = useQuery(api.home.home_get.getQueueData);
  const theme = useTheme();

  return (
    <Link
      variant="h6"
      color={theme.alternateColors.navbarText}
      fontWeight={600}
      href=""
      underline="none"
      sx={{ display: "flex", alignItems: "center" }}
    >
      {queueData?.title}
    </Link>
  );
}
