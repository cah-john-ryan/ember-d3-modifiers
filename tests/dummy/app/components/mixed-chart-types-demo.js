import Component from '@glimmer/component';
import { D3Config, AreaConfig, CircleConfig, LineConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class MixedChartTypesDemoComponent extends Component {
  d3Config = new D3Config({
    dataConfig: {
      'Temperature A': {
        chartTypes: [
          new AreaConfig({ lineWidth: 3, className: 'temperature-a-custom-styling' }),
          new CircleConfig({ radius: 3, lineWidth: 1, className: 'temperature-a-custom-styling' })
        ]
      },
      'Temperature B': {
        chartTypes: [
          new CircleConfig({ radius: 5, lineWidth: 3, className: 'temperature-b-custom-styling' })
        ]
      },
      'Temperature C': {
        chartTypes: [
          new LineConfig({ lineWidth: 3, className: 'temperature-c-custom-styling' })
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
