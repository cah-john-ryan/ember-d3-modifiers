import Component from '@glimmer/component';
import { D3Config, LineConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class LineChartDemoComponent extends Component {
  d3Config = new D3Config({
    dataConfig: {
      'Temperature A': {
        className: 'temperature-a-custom-styling',
        chartTypes: [
          new LineConfig({ lineWidth: 3 })
        ]
      },
      'Temperature B': {
        className: 'temperature-b-custom-styling',
        chartTypes: [
          new LineConfig({ lineWidth: 5 })
        ]
      }
    }
  });
  @service fakeDataGenerator;
  get chartData() {
    return this.fakeDataGenerator.generateFakeTimeSeriesData({
      fakeSeriesIds: ['Temperature A', 'Temperature B'],
      numberOfHoursAgo: 48
    });
  }
}
