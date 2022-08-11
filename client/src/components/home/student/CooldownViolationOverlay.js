import React from 'react';
import {
    Typography, Button, Dialog, DialogContent, Stack
} from '@mui/material';

import HomeService from '../../../services/HomeService';

export default function CooldownViolationOverlay(props) {
    const { open, setOpen, setStatus, questionValue, locationValue, topicValue, setPosition, queueData, timePassed } = props;

    function callAddQuestionAPIOverrideCooldown() {
        HomeService.addQuestion(
            JSON.stringify({
                question: questionValue,
                location: locationValue,
                topic: topicValue,
                andrewID: queueData.andrewID,
                overrideCooldown: true
            })
        ).then(res => {
            if (res.status === 200) {
                setPosition(res.data.position);
                setStatus(res.data.status);
                setOpen(false);
            }
        })
    }

    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
            <DialogContent sx={{ p: 5, textAlign: 'center' }} >
                <Typography variant='h6' textAlign='center'>
                    You rejoined the queue too quickly! Please wait for {queueData.rejoinTime} minutes after finishing your last question, which will be in {queueData.rejoinTime - timePassed} minutes.
                </Typography>

                <Stack alignItems="baseline" justifyContent="space-around" direction="row" spacing={3}>
                    <Button onClick={() => callAddQuestionAPIOverrideCooldown()} color='error' fullWidth variant="contained" sx={{ maxHeight: "50px", fontSize: "16px", mt: 3, alignContent: "center" }} type="submit">
                        Override Cooldown
                    </Button>
                    <Button onClick={() => setOpen(false)} color='cancel' fullWidth variant="contained" sx={{ maxHeight: "50px", fontSize: "16px", mt: 3, alignContent: "center" }} type="submit">
                        Close
                    </Button>
                </Stack>

                <Typography lineHeight={1.3} variant='subtitle1' textAlign='center' sx={{ mt: 3 }}>
                    Overriding the cooldown will add you to the queue, however you will be frozen until a TA approves you.
                </Typography>
            </DialogContent>
        </Dialog>
    );
}
