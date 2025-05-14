import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

function ApexBubbleChart({ evaluations }) {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!evaluations || evaluations.length === 0) return;

    // Agrupar avaliações por hora e tipo
    const grouped = {};

    evaluations.forEach(({ created_at, is_bot }) => {
      const date = new Date(created_at);
      const hourKey = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString();

      if (!grouped[hourKey]) {
        grouped[hourKey] = { hour: date.getTime(), bots: 0, humans: 0 };
      }

      if (is_bot) grouped[hourKey].bots += 1;
      else grouped[hourKey].humans += 1;
    });

    // Transformar em dados para bubble chart: [x = hora, y = tipo (1 ou 2), z = contagem]
    const bubbleDataBots = [];
    const bubbleDataHumans = [];

    Object.values(grouped).forEach(entry => {
      if (entry.bots > 0) {
        bubbleDataBots.push({
          x: new Date(entry.hour).toLocaleString(), // legenda legível
          y: 1,
          z: entry.bots
        });
      }
      if (entry.humans > 0) {
        bubbleDataHumans.push({
          x: new Date(entry.hour).toLocaleString(),
          y: 2,
          z: entry.humans
        });
      }
    });

    setSeries([
      {
        name: 'Bots',
        data: bubbleDataBots
      },
      {
        name: 'Humans',
        data: bubbleDataHumans
      }
    ]);
  }, [evaluations]);

  const options = {
    chart: {
      height: 400,
      type: 'bubble'
    },
    dataLabels: {
      enabled: false
    },
    title: {
      text: 'Evaluations by Hour'
    },
    fill: {
      opacity: 0.8
    },
    xaxis: {
      title: { text: 'Hour' },
      labels: { rotate: -45 },
      tickAmount: 10,
      type: 'category'
    },
    yaxis: {
      title: { text: 'Type' },
      labels: {
        formatter: val => (val === 1 ? 'Bot' : val === 2 ? 'Human' : val)
      },
      min: 0,
      max: 3
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const point = w.config.series[seriesIndex].data[dataPointIndex];
        return `
          <div style="padding: 8px">
            <strong>${series[seriesIndex][dataPointIndex]} votes</strong><br/>
            <span>${point.x}</span>
          </div>`;
      }
    }
  };

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="bubble" height={400} />
    </div>
  );
}

export default ApexBubbleChart;
