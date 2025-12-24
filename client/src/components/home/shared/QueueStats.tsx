import React from "react";
import {
  CardContent,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import BaseCard from "../../common/cards/BaseCard";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function QueueStats() {
  const theme = useTheme();

  const queueData = useQuery(api.home.home_get.getQueueData);

  return (
    <BaseCard>
      <CardContent>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          spacing={2}
          alignItems="center"
          justifyContent="space-evenly"
          sx={{ pt: 1 }}
        >
          <div>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
              The queue is
            </Typography>
            {queueData?.is_frozen ? (
              <Typography
                color={theme.palette.error.main}
                variant="h5"
                fontWeight="bold"
                sx={{ mt: 1, mb: 2 }}
              >
                CLOSED
              </Typography>
            ) : (
              <Typography
                color={theme.palette.success.main}
                variant="h5"
                fontWeight="bold"
                sx={{ mt: 1, mb: 2 }}
              >
                OPEN
              </Typography>
            )}
          </div>
          <div>
            <Typography variant="body1" sx={{ mt: 2 }}>
              There are <strong>{queueData?.num_students || 0} students</strong>{" "}
              on the queue.
            </Typography>
            {queueData && (
              <Typography variant="body1" sx={{ mt: 1.5, mb: 2 }}>
                The estimated wait time is{" "}
                <strong>
                  {queueData.num_tas === 0
                    ? 0
                    : Math.floor(
                        (queueData.num_unhelped * queueData.mins_per_student) /
                          queueData.num_tas,
                      )}{" "}
                  minutes
                </strong>{" "}
                from the end of the queue.
              </Typography>
            )}
          </div>
        </Stack>
      </CardContent>
    </BaseCard>
  );
}
