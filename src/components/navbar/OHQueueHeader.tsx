import React from "react";
import { Link } from "@mui/material";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function OHQueueHeader() {
  const queueData = useQuery(api.home.home_get.getQueueData);

  return (
    <Link
      variant="h6"
      color="#FFFFFF"
      fontWeight="bold"
      href=""
      underline="none"
      sx={{ pt: 0.3 }}
    >
      {queueData?.title}
    </Link>
  );
}
