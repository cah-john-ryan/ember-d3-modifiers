import Component from '@glimmer/component';
import * as moment from 'moment';

export default class D3TimeSeriesComponent extends Component {
  d3Config = {
    height: 400,
    width: 900,
    margin: { top: 30, right: 30, bottom: 50, left: 50 },
    axis: {
      x: {
        title: 'Date',
        tickCount: 16
      },
      y: {
        title: 'Temperature (°C)',
        tickCount: 10,
      }
    },
    // startYaxisAtZero: true,
    // defaultDataConfig: {
    //   chartType: 'line',
    //   circleSize: 3,
    //   lineSize: 2,
    //   barWidth: 10
    // },
    dataConfig: {
      'Temperature B': {
        chartType: 'circle',
        circleSize: 3,
        lineSize: 2,
        barWidth: 10
      }
    },
    thresholds: [
      { thresholdId: 'High Temperature Value', value: 6 },
      { thresholdId: 'Low Temperature Value', value: 2 }
    ]
  };

  fakeSeriesIds = ['Temperature A', 'Temperature B', 'Temperature C'];
  // fakeSeriesIds = ['Temperature A'];

  get chartData() {
    let chartDataToRender = [];
    const seedTime = moment().add(-48, 'hour');
    this.fakeSeriesIds.forEach(fakeSeriesId => {
      let fakeTimeSeries = this.generateFakeTimeSeries(fakeSeriesId, seedTime.clone());
      chartDataToRender.push(...fakeTimeSeries);
    });
    return chartDataToRender;
  }

  generateFakeTimeSeries(fakeSeriesId, seedTime) {
    let data = [];
    let d = seedTime;
    for (let i = 0, v = 4; i < 48; ++i) {
      v += Math.random() - 0.5;
      v = i === 0 ? 4 : Math.max(Math.min(v, 8), 0);
      data.push({
        seriesId: fakeSeriesId,
        date: d.toDate(),
        value: v
      });

      d = d.add(1, 'hour');
    }
    return data;
  }
}
