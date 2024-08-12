import React, { useEffect, useState } from 'react';
import { Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '../../../components/shared/DashboardCard';
import Chart from 'react-apexcharts';
import axios from 'axios';

const Stat = () => {
    const [month, setMonth] = useState(''); // Default to show all year
    const [questionsData, setQuestionsData] = useState(Array(12).fill(0));
    const [answersData, setAnswersData] = useState(Array(12).fill(0));
    const [filteredQuestionsData, setFilteredQuestionsData] = useState(Array(12).fill(0));
    const [filteredAnswersData, setFilteredAnswersData] = useState(Array(12).fill(0));

    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    useEffect(() => {
        // Fetch data from API
        axios.get('http://localhost:8080/api/questions')
            .then(response => {
                const data = response.data;
                console.log(data)

                
                const questionsCounts = Array(12).fill(0);
                const answersCounts = Array(12).fill(0);

                data.forEach(question => {
                    const questionMonth = new Date(question.createdAt).getMonth();
                    questionsCounts[questionMonth] += 1;

                    question.answers.forEach(answer => {
                        const answerMonth = new Date(answer.createdAt).getMonth();
                        answersCounts[answerMonth] += 1;
                    });
                });

                setQuestionsData(questionsCounts);
                setAnswersData(answersCounts);
                updateFilteredData(''); // Default to show all year
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const updateFilteredData = (selectedMonth) => {
        const newQuestionsData = Array(12).fill(0);
        const newAnswersData = Array(12).fill(0);

        if (selectedMonth === '') {
            // Display data for the entire year
            for (let i = 0; i < 12; i++) {
                newQuestionsData[i] = questionsData[i];
                newAnswersData[i] = answersData[i];
            }
        } else {
            // Filter data based on the selected month
            const monthIndex = selectedMonth - 1; // Convert to 0-based index
            newQuestionsData[monthIndex] = questionsData[monthIndex];
            newAnswersData[monthIndex] = answersData[monthIndex];
        }

        setFilteredQuestionsData(newQuestionsData);
        setFilteredAnswersData(newAnswersData);
    };

    useEffect(() => {
        // Update the filtered data whenever the month or raw data changes
        updateFilteredData(month);
    }, [month, questionsData, answersData]);

    const handleChange = (event) => {
        setMonth(event.target.value);
    };

    const getMonthNames = () => {
        const monthNames = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date(0, i);
            monthNames.push(date.toLocaleString('default', { month: 'long' }));
        }
        return monthNames;
    };

    const monthNames = getMonthNames();

    const optionscolumnchart = {
        chart: {
            type: 'bar',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: {
                show: true,
            },
            height: 370,
        },
        colors: [primary, '#9c27b0'], // Changed color of Answers to purple
        plotOptions: {
            bar: {
                horizontal: false,
                barHeight: '60%',
                columnWidth: '42%',
                borderRadius: [6],
                borderRadiusApplication: 'end',
                borderRadiusWhenStacked: 'all',
            },
        },
        stroke: {
            show: true,
            width: 5,
            lineCap: "butt",
            colors: ["transparent"],
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.1)',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: false,
                },
            },
        },
        yaxis: {
            tickAmount: 4,
        },
        xaxis: {
            categories: monthNames,
            axisBorder: {
                show: false,
            },
        },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            fillSeriesColor: false,
        },
    };

    const seriescolumnchart = [
        {
            name: 'Questions',
            data: filteredQuestionsData,
        },
        {
            name: 'Answers',
            data: filteredAnswersData,
        },
    ];

    return (
        <DashboardCard title="Admin Stats" action={
            <Select
                labelId="month-dd"
                id="month-dd"
                value={month}
                size="small"
                onChange={handleChange}
            >
                <MenuItem value="">
                    Toute l'année
                </MenuItem>
                {monthNames.map((name, index) => (
                    <MenuItem
                        key={index}
                        value={index + 1}
                        style={{ color: index === 0 ? 'red' : 'inherit' }} // Change color of the first month (e.g., January)
                    >
                        {name} 2024
                    </MenuItem>
                ))}
            </Select>
        }>
            <Chart
                options={optionscolumnchart}
                series={seriescolumnchart}
                type="bar"
                height="370px"
            />
        </DashboardCard>
    );
};

export default Stat;
