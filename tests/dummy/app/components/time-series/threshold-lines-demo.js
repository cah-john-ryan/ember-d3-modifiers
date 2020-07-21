import Component from '@glimmer/component';
import { D3TimeSeriesConfig, LineConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class TimeSeriesThresholdLinesDemoComponent extends Component {
  d3Config = new D3TimeSeriesConfig({
    dataConfig: {
      'Temperature A': {
        className: 'series-a-custom-styling',
        chartTypes: [
          new LineConfig({ lineWidth: 3 })
        ]
      }
    },
    axis: {
      y: {
        startsAtZero: true
      }
    }
  });

  thresholds = [
    { thresholdId: 'High Value Threshold', value: 5, className: 'threshold-line' },
    { thresholdId: 'Low Value Threshold', value: 3, className: 'threshold-line' }
  ];

  @service fakeDataGenerator;
  get chartData() {
    return this.fakeDataGenerator.generateFakeTimeSeriesData({
      fakeSeriesIds: ['Temperature A'],
      numberOfHoursAgo: 48
    });
  }
}
