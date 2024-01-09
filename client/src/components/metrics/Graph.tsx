import React, {useState, useEffect} from 'react';
import {
  Typography, useTheme,
} from '@mui/material';

import {DateTime} from 'luxon';
import {ResponsiveContainer, LineChart, BarChart, Bar, Line, Label, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';

import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as Tooltip2, Legend} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip2, Legend);
import {Line as Line2} from 'react-chartjs-2';

import MetricsService from '../../services/MetricsService';

export default function Graph() {
  const theme = useTheme();
  const [numStudentsPerDayLastWeek, setNumStudentsPerDayLastWeek] = useState([]);
  const [numStudentsPerDay, setNumStudentsPerDay] = useState([]);
  const [numStudentsOverall, setNumStudentsOverall] = useState([]);

  useEffect(() => {
    MetricsService.getNumStudentsPerDayLastWeek().then((res) => {
      setNumStudentsPerDayLastWeek(res.data.numStudentsPerDayLastWeek);
    });

    MetricsService.getNumStudentsPerDay().then((res) => {
      setNumStudentsPerDay(res.data.numStudentsPerDay);
    });

    MetricsService.getNumStudentsOverall().then((res) => {
      setNumStudentsOverall(res.data.numStudentsOverall);
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
      <Line2
        datasetIdKey='numStudentsPerDayLastWeek'
        options={{
          layout: {
            padding: {
              top: 40,
              right: 100,
              bottom: 40,
              left: 50,
            },
          },
          responsive: true,
          aspectRatio: 3,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 16,
                },
              },
              grid: {
                color: theme.palette.divider,
              },
            },
            y: {
              title: {
                display: true,
                text: 'Number of Students',
                font: {
                  size: 16,
                },
              },
              ticks: {
                autoSkip: true,
              },
              grid: {
                color: theme.palette.divider,
              },
            },
          },
        }}

        data={{
          labels: numStudentsPerDayLastWeek.map((day) => dateFormatter(day.day)),
          datasets: [
            {
              label: 'Number of Students',
              data: numStudentsPerDayLastWeek.map((day) => day.students),
              fill: false,
              backgroundColor: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              borderWidth: 3,
              tension: 0.3,
            },
          ],
        }}
      />

      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
        Number of Students per Day (overall)
      </Typography>
      <ResponsiveContainer width={'92%'} height={400}>
        <LineChart data={numStudentsOverall} margin={{top: 40, right: 0, bottom: 40, left: 50}}>
          <Line type="monotone" dataKey="students" strokeWidth={3} stroke={theme.palette.primary.main}/>
          <CartesianGrid stroke="#ccc" />
          <XAxis tickFormatter={dateFormatter} dataKey="day" domain={['dataMin', 'dataMax']}>
            <Label
              value={'Day'}
              position="bottom"
              style={{textAnchor: 'middle'}}
            />
          </XAxis>
          <YAxis dataKey="students" domain={[0, 'dataMax']}>
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

      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
      Number of Students per Day of the Week
      </Typography>
      <ResponsiveContainer width={'92%'} height={400}>
        <BarChart margin={{top: 40, right: 0, bottom: 40, left: 50}} data={numStudentsPerDay}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="day" />
          <Label
            value={'Day'}
            position="bottom"
            style={{textAnchor: 'middle'}}
          />
          <YAxis dataKey="students" domain={[0, 'dataMax']}>
            <Label
              value={'Number of Students'}
              position="left"
              angle={-90}
              style={{textAnchor: 'middle'}}
            />
          </YAxis>
          <Tooltip />
          <Bar dataKey="students" fill= {theme.palette.primary.main} />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}
