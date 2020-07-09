import Component from '@glimmer/component';
import { D3Config, CircleConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class ScatterPlotDemoComponent extends Component {
  d3Config = new D3Config({
    dataConfig: {
      'Temperature A': {
        className: 'temperature-a-custom-styling',
        chartTypes: [
          new CircleConfig({ radius: 8, lineWidth: 2 })
        ]
      },
      'Temperature B': {
        className: 'temperature-b-custom-styling',
        chartTypes: [
          new CircleConfig({ radius: 6, lineWidth: 3 })
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
