import {
    Typography, useTheme
} from '@mui/material';

import { DateTime } from 'luxon';
import { ResponsiveContainer, LineChart, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function createData(time, no_students) {
    return { "time": time, "students": no_students };
}

const data = [
    { time: 1659116497, students: 15},
    { time: 1659216697, students: 20},
    { time: 1659416897, students: 30}
];

export default function Graph() {
    const theme = useTheme();

    const dateFormatter = (date) => {
        return DateTime.fromMillis(date).toLocaleString(DateTime.DATE_SHORT);
    };

    return (
        <div>
            <Typography variant="h5" sx={{ mt: 4, ml: 10 }} fontWeight='bold'>
                Number of Students per Day
            </Typography>
            <ResponsiveContainer width={"92%"} height={400}>
                <LineChart data={data} margin={{ top: 40, right: 0, bottom: 40, left: 50 }}>
                    <Line type="monotone" dataKey="students" strokeWidth={3} stroke={theme.palette.primary.main}/>
                    <CartesianGrid stroke="#ccc" />
                    <XAxis type="number" tickFormatter={dateFormatter} dataKey="time" domain={["dataMin", "dataMax"]}>
                        <Label
                            value={"Day"}
                            position="bottom"
                            style={{ textAnchor: "middle" }}
                        />
                    </XAxis>
                    <YAxis dataKey="students">
                        <Label
                            value={"Number of Students"}
                            position="left"
                            angle={-90}
                            style={{ textAnchor: "middle" }}
                        />
                    </YAxis>
                    <Tooltip 
                        labelFormatter={dateFormatter}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
