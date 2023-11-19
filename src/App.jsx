import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Chart as ChartJS, CategoryScale, PointElement, Tooltip } from 'chart.js'
import * as ChartGeo from 'chartjs-chart-geo'
import React from 'react'
import { BubbleMapController, GeoFeature, ColorScale, ProjectionScale, SizeScale } from 'chartjs-chart-geo';
import Papa from 'papaparse';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(Tooltip, ChartDataLabels, GeoFeature, ColorScale, ProjectionScale, CategoryScale, BubbleMapController, SizeScale, PointElement);


function App() {
    let [usStates, setUSStates] = useState(null);
    let [data, setData] = useState(null);

    if (!usStates) {
      Promise.all([
          fetch('https://unpkg.com/us-atlas/states-10m.json')
            .then((r) => r.json()),
          fetch('https://gist.githubusercontent.com/mbostock/9535021/raw/928a5f81f170b767162f8f52dbad05985eae9cac/us-state-capitals.csv')
            .then((r) => r.text()).then((d) => Papa.parse(d, { dynamicTyping: true, header: true}).data)
        ]).then(([us, data]) => {
          setUSStates(us);
          setData(data);
      });
    }

    function updateData() {
      data = data.map((obj) => {
        if (obj.name === "Arizona") {
          obj.latitude = 35.0;
          obj.longitude = -117.0;
        }
        return obj;
      });
      setData(data);
    }

    if (!usStates) {
      return (<p>Loading..</p>);
    } else {
      return ( 
        <>
          <USPageMap data={data} usStates={usStates}/>
          <button type="submit" onClick={() => updateData()} >Refresh</button>
        </>
      );
    }
}


const USPageMap = ({data, usStates}) => {

    useEffect(() => {
        let canvas = document.getElementById("canvas")
        if (!canvas) { 
          return;
        }

        let chartStatus = ChartJS.getChart("canvas"); // <canvas> id
        if (chartStatus != undefined) {
          chartStatus.destroy();
        }

          const states = ChartGeo.topojson.feature(usStates, usStates.objects.states).features;
          
          const chart = new ChartJS(document.getElementById("canvas").getContext("2d"), {
            type: 'bubbleMap', 
            data: {
              labels: data.map((d) => d.description),
              datasets: [{
                outline: states,
                showOutline: true,
                backgroundColor: ['#00f', '#0f0', '#f00'],
                data: data.map((d, i) => Object.assign(d, {value: Math.round(Math.random() * 10)})),
              }]
            },
            options: {
              plugins: {
                legend: {
                  display: false
                },
                datalabels: {
                  align: 'top',
                  formatter: (v) => {
                    return v.name;
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      return [
                        context.raw.name + ' (Latitude: '+context.raw.latitude+ ', Longitude: '+context.raw.longitude+')'
                      ];
                    },
                  }
                }
              },
              elements: {
                point: {
                  radius: 5
                }
              },
              scales: {
                projection: {
                  axis: 'x',
                  projection: 'albersUsa', 
                },
                size: {
                  display: false,
                  axis: 'x',
                  size: [1, 20],
                }
              }
            }
          });
    })

    return (
        <div>
            <canvas id='canvas'></canvas>
        </div>
    )
}

export default App