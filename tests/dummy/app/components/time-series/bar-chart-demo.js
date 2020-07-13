import Component from '@glimmer/component';
import { D3TimeSeriesConfig, BarConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class TimeSeriesBarChartDemoComponent extends Component {
  // Note: At present the plugin is not friendly with multiple series being provided.
  d3Config = new D3TimeSeriesConfig({
    dataConfig: {
      'Temperature A': {
        className: 'series-a-custom-styling',
        chartTypes: [
          new BarConfig({ barWidth: 10, lineWidth: 1 })
        ]
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
