import Component from '@glimmer/component';
import { D3TimeSeriesConfig, LineConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';
import { action } from '@ember/object';
import { A } from '@ember/array';

export default class TimeSeriesChangingThresholdLinesDemoComponent extends Component {
  @tracked d3Config = new D3TimeSeriesConfig({
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

  @tracked thresholds = A([
    { thresholdId: 'Threshold 1', value: 1, className: 'threshold-line' }
  ]);

  @action
  addThresholds() {
    later(this, () => {
      this.thresholds.pushObject({ thresholdId: 'Threshold 2', value: 2, className: 'threshold-line' });
    }, 2000);
    later(this, () => {
      this.thresholds.pushObject({ thresholdId: 'Threshold 3', value: 3, className: 'threshold-line' });
    }, 3000);
    later(this, () => {
      this.thresholds.pushObject({ thresholdId: 'Threshold 4', value: 4, className: 'threshold-line' });
    }, 4000);

    later(this, () => {
      const thresholdToRemove = this.thresholds.findBy('thresholdId', 'Threshold 1');
      this.thresholds.removeObject(thresholdToRemove);
    }, 5000);
  }

  @service fakeDataGenerator;
  get chartData() {
    return this.fakeDataGenerator.generateFakeTimeSeriesData({
      fakeSeriesIds: ['Temperature A'],
      numberOfHoursAgo: 48
    });
  }
}
