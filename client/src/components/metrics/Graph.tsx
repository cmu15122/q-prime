import React, {useState, useEffect} from 'react';
import {
  Typography, useTheme,
} from '@mui/material';

import {DateTime} from 'luxon';

import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as Tooltip2, Legend} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip2, Legend);
import {Line, Bar} from 'react-chartjs-2';

import MetricsService from '../../services/MetricsService';

export default function Graph() {
  const theme = useTheme();
  const [numQuestionsPerDayLastWeek, setNumQuestionsPerDayLastWeek] = useState([]);
  const [numQuestionsPerDay, setNumQuestionsPerDay] = useState([]);
  const [numQuestionsOverall, setNumQuestionsOverall] = useState([]);
  const [numQuestionsPerTopic, setNumQuestionsPerTopic] = useState([]);

  useEffect(() => {
    MetricsService.getNumStudentsPerDayLastWeek().then((res) => {
      setNumQuestionsPerDayLastWeek(res.data.numStudentsPerDayLastWeek);
    });

    MetricsService.getNumStudentsPerDay().then((res) => {
      const dataBack = res.data.numStudentsPerDay;
      // sort by day of week
      dataBack.sort((a, b) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.indexOf(a.day) - days.indexOf(b.day);
      });

      setNumQuestionsPerDay(dataBack);
    });

    MetricsService.getNumStudentsOverall().then((res) => {
      setNumQuestionsOverall(res.data.numStudentsOverall);
    });

    MetricsService.getNumQuestionsPerTopic().then((res) => {
      console.log(res.data.numQuestionsPerTopic);
      setNumQuestionsPerTopic(res.data.numQuestionsPerTopic);
    });
  }, []);

  const dateFormatter = (day) => {
    return DateTime.fromISO(day).toLocaleString({month: 'long', day: 'numeric'});
  };

  return (
    <div>
      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
        Number of Questions per Day (in the last week)
      </Typography>

      <div style={{height: '40vh', width: 'auto', position: 'relative'}}>
        <Line
          datasetIdKey='numQuestionsPerDayLastWeek'
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
            maintainAspectRatio: false,
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
                  text: 'Number of Questions',
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
            labels: numQuestionsPerDayLastWeek.map((day) => dateFormatter(day.day)),
            datasets: [
              {
                label: 'Number of Questions',
                data: numQuestionsPerDayLastWeek.map((day) => day.students),
                fill: false,
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                borderWidth: 3,
                tension: 0.3,
              },
            ],
          }}
        />
      </div>

      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
        Number of Questions per Day (semester)
      </Typography>

      <div style={{height: '40vh', width: 'auto', position: 'relative'}}>
        <Line
          datasetIdKey='numQuestionsPerDayOverall'
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
            maintainAspectRatio: false,
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
                  text: 'Number of Questions',
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
            labels: numQuestionsOverall.map((day) => dateFormatter(day.day)),
            datasets: [
              {
                label: 'Number of Questions',
                data: numQuestionsOverall.map((day) => day.students),
                fill: false,
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                borderWidth: 3,
                tension: 0.3,
              },
            ],
          }}
        />
      </div>

      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
      Number of Questions per Day of the Week
      </Typography>

      <div style={{height: '40vh', width: 'auto', position: 'relative'}}>
        <Bar
          datasetIdKey='numQuestionsPerDayOfWeek'
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
            maintainAspectRatio: false,
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
                  text: 'Number of Questions',
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
            labels: numQuestionsPerDay.map((day) => day.day),
            datasets: [
              {
                label: 'Number of Questions',
                data: numQuestionsPerDay.map((day) => day.students),
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                borderWidth: 3,
              },
            ],
          }}
        />
      </div>

      <Typography variant="h5" sx={{mt: 4, ml: 10}} fontWeight='bold'>
      Number of Questions per Topic
      </Typography>

      <div style={{height: '40vh', width: 'auto', position: 'relative'}}>
        <Bar
          datasetIdKey='numQuestionsPerTopic'
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
            maintainAspectRatio: false,
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
                  text: 'Number of Questions',
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
            labels: numQuestionsPerTopic.map((topic) => topic.name),
            datasets: [
              {
                label: 'Number of Questions',
                data: numQuestionsPerTopic.map((topic) => topic.count),
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                borderWidth: 3,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
