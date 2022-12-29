import React, {useState, useEffect} from 'react';
import {
  Typography, useTheme,
} from '@mui/material';

import {DateTime} from 'luxon';
import {ResponsiveContainer, LineChart, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';


const data = [
  {time: 1659116497, students: 15},
  {time: 1659216697, students: 20},
  {time: 1659416897, students: 30},
];

import MetricsService from '../../services/MetricsService';

export default function Graph() {
  const theme = useTheme();
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    MetricsService.getNumStudentsPerDayLastWeek().then((res) => {
      console.log(res.data.numStudentsPerDayLastWeek);
      setGraphData(res.data.numStudentsPerDayLastWeek);
    });
  }, []);

  const dateFormatter = (day) => {
    return DateTime.fromISO(day).toLocaleString({month: 'long', day: 'numeric'});
  };

  return (
    <div>
      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
        Number of Students per Day (in the last week)
      </Typography>
      <ResponsiveContainer width={'92%'} height={400}>
        <LineChart data={graphData} margin={{top: 40, right: 0, bottom: 40, left: 50}}>
          <Line type="monotone" dataKey="students" strokeWidth={3} stroke={theme.palette.primary.main}/>
          <CartesianGrid stroke="#ccc" />
          <XAxis tickFormatter={dateFormatter} dataKey="day" domain={['dataMin', 'dataMax']}>
            <Label
              value={'Day'}
              position="bottom"
              style={{textAnchor: 'middle'}}
            />
          </XAxis>
          <YAxis dataKey="students">
            <Label
              value={'Number of Students'}
              position="left"
              angle={-90}
              style={{textAnchor: 'middle'}}
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
