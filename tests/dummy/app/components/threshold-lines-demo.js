import Component from '@glimmer/component';
import { D3Config, LineConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ThresholdLinesDemoComponent extends Component {
  @tracked d3Config;

  @action
  setupConfig() {
    this.d3Config = new D3Config({
      dataConfig: {
        'Temperature A': {
          className: 'temperature-a-custom-styling',
          chartTypes: [
            new LineConfig({ lineWidth: 3 })
          ]
        }
      },
      thresholds: [
        { thresholdId: 'High Value Threshold', value: 5, className: 'high-value-threshold' },
        { thresholdId: 'Low Value Threshold', value: 3, className: 'low-value-threshold' }
      ]
    });
    this.d3Config.startYaxisAtZero = true;
  }

  @service fakeDataGenerator;
  get chartData() {
    return this.fakeDataGenerator.generateFakeTimeSeriesData({
      fakeSeriesIds: ['Temperature A'],
      numberOfHoursAgo: 48
    });
  }
}
