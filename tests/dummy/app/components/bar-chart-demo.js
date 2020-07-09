import Component from '@glimmer/component';
import { D3Config, BarConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class BarChartDemoComponent extends Component {
  // Note: At present the plugin is not friendly with multiple series being provided.
  d3Config = new D3Config({
    dataConfig: {
      'Temperature A': {
        className: 'temperature-a-custom-styling',
        chartTypes: [
          new BarConfig({ barWidth: 13, lineWidth: 2 })
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
