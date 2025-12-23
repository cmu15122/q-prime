import React, { useState, useEffect } from "react";
import {
  Button,
  CardContent,
  Typography,
  TextField,
  Stack,
  Tooltip,
} from "@mui/material";

import BaseCard from "../common/cards/BaseCard";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import TASettings from "./admin/TASettings";

export default function OwnerSettings() {
  const userData = useQuery(api.home.home_get.getUserData);
  const adminSettings = useQuery(api.settings.settings_get.getQueueSettings);

  const [currSem, setCurrSem] = useState<string>("");

  useEffect(() => {
    if (adminSettings) {
      setCurrSem(adminSettings.currSem);
    }
  }, [adminSettings]);


  const changeSemesterMutation = useMutation(
    api.settings.settings_mutate.changeSemester,
  );
  const handleUpdateSemester = async (event) => {
    event.preventDefault();
    await changeSemesterMutation({ new_sem_name: currSem });
  };

  // if user is not an admin TA, we should still show TASettings so they can add new TAs
  // if they are an admin TA, then AdminMain will show this


  return (
    <div style={{ paddingBottom: "80px" }}>
      <Typography
        variant="h4"
        textAlign="center"
        sx={{ my: 4 }}
        fontWeight="bold"
      >
        Owner Settings
      </Typography>

      <BaseCard>
        <CardContent>
          <Typography
            sx={{ fontWeight: "bold", ml: 1, mt: 1 }}
            variant="body1"
            gutterBottom
          >
            Owner Settings
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <form onSubmit={handleUpdateSemester}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography>Current Semester:</Typography>
                <TextField
                  size="small"
                  value={currSem ?? ""}
                  onChange={(e) => setCurrSem(e.target.value)}
                  disabled={!(userData?.is_owner || false)}
                  inputProps={{ maxLength: 3 }}
                  sx={{ width: 80 }}
                />
                {!userData?.is_owner ? null : (
                  <Tooltip
                    title={
                      <Typography>
                        Update Current Semester First, this initializes your
                        semester!
                      </Typography>
                    }
                    placement="right"
                    arrow
                    open={currSem != undefined && adminSettings?.currSem === ""}
                    enterDelay={1000}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!(userData?.is_owner || false)}
                    >
                      Save
                    </Button>
                  </Tooltip>
                )}
                <Typography variant="caption" color="text.secondary">
                  {!(userData?.is_owner || false)
                    ? `Only ${adminSettings?.ownerEmails || []} can change semester`
                    : "Each semester has its own settings and stats"}
                </Typography>
              </Stack>
            </form>
          </Stack>

        </CardContent>
      </BaseCard>
      {(userData && !(userData.ta_data?.is_admin)) && <TASettings />}
    </div>
  );
}
