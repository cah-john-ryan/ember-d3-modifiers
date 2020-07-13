import Component from '@glimmer/component';
import { D3TimeSeriesConfig, CircleConfig, LineConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class TimeSeriesLineWithCirclesChartDemoComponent extends Component {
  d3Config = new D3TimeSeriesConfig({
    dataConfig: {
      'Temperature A': {
        className: 'series-a-custom-styling',
        chartTypes: [
          new LineConfig({ lineWidth: 3 }),
          new CircleConfig({ radius: 5, lineWidth: 2 })
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
