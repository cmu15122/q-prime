import { useState, useEffect } from "react";
import {
    CardContent, Divider, Stack, Typography, useTheme,
} from "@mui/material";

import BaseCard from "../../common/cards/BaseCard";

import { socketSubscribeTo } from "../../../services/SocketsService";

export default function QueueStats(props) {
    const { queueData, queueFrozen } = props;
    const theme = useTheme();

    // TODO : change based on whether on queue or not

    const [numStudents, setNumStudents] = useState(0);
    const [waitTime, setWaitTime] = useState(0);

    useEffect(() => {
        socketSubscribeTo("waittimes", (data) => {
            setWaitTime(data.numUnhelped * data.minsPerStudent)
            setNumStudents(data.numStudents)
        });
    }, []);

    useEffect(() => {
        if (queueData != null) {
            setNumStudents(queueData.numStudents);
            setWaitTime(queueData.waitTime);
        }
    }, [queueData]);

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
                        <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>The queue is</Typography>
                        {
                            queueFrozen ?
                                <Typography color={theme.palette.error.main} variant="h5" fontWeight="bold" sx={{ mt: 1, mb: 2 }}>CLOSED</Typography>
                                :
                                <Typography color={theme.palette.success.main} variant="h5" fontWeight="bold" sx={{ mt: 1, mb: 2 }}>OPEN</Typography>
                        }
                    </div>
                    <div>
                        <Typography variant="body1" sx={{ mt: 2 }}>There are <strong>{numStudents} students</strong> on the queue.</Typography>
                        <Typography variant="body1" sx={{ mt: 1.5, mb: 2 }}>The estimated wait time is <strong>{waitTime} minutes</strong> from the end of the queue.</Typography>
                    </div>
                </Stack>
            </CardContent>
        </BaseCard>
    );
}
