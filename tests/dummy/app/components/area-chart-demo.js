import Component from '@glimmer/component';
import { D3Config, AreaConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class AreaChartDemoComponent extends Component {
  d3Config = new D3Config({
    dataConfig: {
      'Temperature A': {
        chartTypes: [
          new AreaConfig({ lineWidth: 2, className: 'temperature-a-custom-styling' })
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
