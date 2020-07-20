import Component from '@glimmer/component';
import { D3TimeSeriesConfig, LineConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TimeSeriesThresholdLinesDemoComponent extends Component {
  @tracked d3Config = new D3TimeSeriesConfig({
    dataConfig: {
      'Temperature A': {
        className: 'series-a-custom-styling',
        chartTypes: [
          new LineConfig({ lineWidth: 3 })
        ]
      }
    },
    thresholds: [
      { thresholdId: 'High Value Threshold', value: 5, className: 'high-value-threshold' },
      { thresholdId: 'Low Value Threshold', value: 3, className: 'low-value-threshold' }
    ],
    axis: {
      y: {
        startsAtZero: true
      }
    }
  });

  @service fakeDataGenerator;
  get chartData() {
    return this.fakeDataGenerator.generateFakeTimeSeriesData({
      fakeSeriesIds: ['Temperature A'],
      numberOfHoursAgo: 48
    });
  }
}
