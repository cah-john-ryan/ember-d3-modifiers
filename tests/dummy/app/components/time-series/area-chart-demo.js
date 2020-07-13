import Component from '@glimmer/component';
import { AreaConfig, D3TimeSeriesConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class TimeSeriesAreaChartDemoComponent extends Component {
  d3Config = new D3TimeSeriesConfig({
    dataConfig: {
      'Temperature A': {
        className: 'series-a-custom-styling',
        chartTypes: [
          new AreaConfig({ lineWidth: 2 })
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
