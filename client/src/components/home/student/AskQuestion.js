import * as React from 'react';
import {
    Typography,
    Divider,
    Card,
    CardContent,
    Stack,
    FormControl,
    InputLabel,
    MenuItem,
    Box,
    Select,
    Input,
    Button
} from '@mui/material'
import HomeService from '../../../services/HomeService';

export default function AskQuestion(props) {
    const locations = ['Remote', 'GHC 4211', 'Honk\'s Closet'];
    const topics = ['Knock knock', 'Who\'s there?', 'Honk', 'Honk Who?', 'Honk you!'];
    
    const { 
        questionValue, 
        setQuestionValue, 
        locationValue,
        setLocationValue,
        topicValue,
        setTopicValue,
        theme, 
        setPosition, 
        setAskQuestionOrYourEntry 
    } = props

    function handleSubmit(event) {
        event.preventDefault();

        callAddQuestionAPI()
    }
    
    function callAddQuestionAPI() {

        HomeService.addQuestion(
            JSON.stringify({
                // TODO: unclear if this is entirely safe
                question: questionValue,
                location: locationValue,
                topic: topicValue
            })
        ).then(res => {
            if(res.status === 200) {
                setPosition(res.data.position)
                setAskQuestionOrYourEntry(true)
            } else {
                console.log('error with adding to queue')
            }
        })
    }

    return (
        <div className='card' style={{display:'flex'}}>
            <Card sx={{ minWidth : '100%', background: theme.palette.background.paper}}>
                <CardContent>
                    <Typography variant='h5' sx={{fontWeight: 'bold', textAlign: 'left'}}>Ask A Question</Typography>
                    
                    <Divider sx={{marginTop: ".5em", marginBottom:"1em"}}/>

                    <form onSubmit={handleSubmit}>
                        <Stack direction="row" justifyContent="left">
                            <Box sx={{ minWidth: 120, width: "47%"}}>
                                <FormControl required fullWidth>
                                    <InputLabel id="demo-simple-select-label">Location</InputLabel>
                                    <Select
                                        labelId="location-select-label"
                                        id="location-select"
                                        value={locationValue}
                                        label="Location"
                                        onChange={(e)=>setLocationValue(e.target.value)}
                                    >
                                        {locations.map((loc) => <MenuItem value={loc} key={loc}>{loc}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ minWidth: 120, width: "47%", margin: "auto", marginRight: ".5em" }}>
                                <FormControl required fullWidth>
                                    <InputLabel id="demo-simple-select-label">Topic</InputLabel>
                                    <Select
                                        labelId="topic-select-label"
                                        id="topic-select"
                                        value={topicValue}
                                        label="Topic"
                                        onChange={(e)=>setTopicValue(e.target.value)}
                                    >
                                        {topics.map((top) => <MenuItem value={top} key={top}>{top}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Stack>
                        <Typography variant='h5' sx={{fontWeight: 'bold', textAlign: 'left', marginTop: "2em"}}>Question:</Typography>
                        <FormControl required fullWidth>
                            <Input 
                                placeholder='Question (max 256 characters)'
                                onChange={(event)=>setQuestionValue(event.target.value)}
                                fullWidth
                                multiline
                                inputProps={{ maxLength: 256 }}
                                type="text"
                            />
                        </FormControl>
                        <Button fullWidth variant="contained" sx={{marginTop: "1em", alignContent: "center"}} type="submit">
                            Ask
                        </Button>

                        <Divider sx={{marginTop: ".5em", marginBottom:"1em"}}/>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
