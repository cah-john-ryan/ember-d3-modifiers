import Component from '@glimmer/component';
import { D3TimeSeriesConfig, AreaConfig, CircleConfig, LineConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class TimeSeriesMixedChartTypesDemoComponent extends Component {
  d3Config = new D3TimeSeriesConfig({
    dataConfig: {
      'Temperature A': {
        className: 'series-a-custom-styling',
        chartTypes: [
          new AreaConfig({ lineWidth: 3 }),
          new CircleConfig({ radius: 3, lineWidth: 1 })
        ]
      },
      'Temperature B': {
        className: 'series-b-custom-styling',
        chartTypes: [
          new CircleConfig({ radius: 5, lineWidth: 3 })
        ]
      },
      'Temperature C': {
        className: 'series-c-custom-styling',
        chartTypes: [
          new LineConfig({ lineWidth: 3 })
        ]
      }
    },
    thresholds: [
      { thresholdId: 'High Value Threshold', value: 5, className: 'high-value-threshold' },
    ]
  });
  @service fakeDataGenerator;
  get chartData() {
    return this.fakeDataGenerator.generateFakeTimeSeriesData({
      fakeSeriesIds: ['Temperature A', 'Temperature B', 'Temperature C'],
      numberOfHoursAgo: 48
    });
  }
}
