import Component from '@glimmer/component';
import { D3Config, LineConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class ThresholdLinesDemoComponent extends Component {
  d3Config = new D3Config({
    dataConfig: {
      'Temperature A': {
        chartTypes: [
          new LineConfig({ lineWidth: 3, className: 'temperature-a-custom-styling' })
        ]
      }
    },
    thresholds: [
      { thresholdId: 'High Value Threshold', value: 5, className: 'high-value-threshold' },
      { thresholdId: 'Low Value Threshold', value: 3, className: 'low-value-threshold' }
    ]
  });
  @service fakeDataGenerator;
  get chartData() {
    return this.fakeDataGenerator.generateFakeTimeSeriesData({
      fakeSeriesIds: ['Temperature A'],
      numberOfHoursAgo: 48
    });
  }
}
