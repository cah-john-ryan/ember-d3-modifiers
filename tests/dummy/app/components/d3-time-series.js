import Component from '@glimmer/component';
import * as moment from 'moment';
import { D3Config, AreaConfig, CircleConfig, LineConfig } from 'ember-d3-modifiers';

export default class D3TimeSeriesComponent extends Component {

  d3Config = new D3Config({
    genericDataConfig: {
      chartTypes: [
        new CircleConfig({ radius: 4, lineWidth: 1, className: null })
      ]
    },
    dataConfig: {
      'Temperature A': {
        chartTypes: [
          new AreaConfig({ lineWidth: 1 })
        ]
      },
      'Temperature B': {
        chartTypes: [
          new LineConfig({ lineWidth: 1 }),
          new CircleConfig({ radius: 5, lineWidth: 2 })
        ]
      },
      'Temperature D': {
        chartTypes: [
          new LineConfig({ lineWidth: 4, className: 'temperature-d-custom-styling' })
        ]
      }
    },
    thresholds: [
      { thresholdId: 'High Temperature Value', value: 6 },
      { thresholdId: 'Low Temperature Value', value: 2, className: 'low-temperature-custom-styling' }
    ]
  });

  // d3Config = new D3Config();

  /*
  TODO's:
  1. DONE: fix bar chart y axis (bug)
  2. DONE: fix area chart y axis (bug)
  3. SCRATCHED(NO): consolidate the sizing/width for the charttypes
  4. DONE: add className to the dataConfig items and the thresholds
  5. DONE: provide a function for tooltip formatting (loop through each series as its own call)
  6. DONE: tooltip config to turn off the vertical bar
  7. DONE: use a dictionary of render functions
  8. DONE: tilt the x axis tick labels
  9. DONE: move the d3config into a class file export
  */

  // fakeSeriesIds = ['Temperature A', 'Temperature B', 'Temperature C', 'Temperature D'];
  fakeSeriesIds = ['Temperature A', 'Temperature B', 'Temperature C', 'Temperature D'];

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
