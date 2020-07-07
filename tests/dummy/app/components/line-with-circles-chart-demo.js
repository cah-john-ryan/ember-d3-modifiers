import Component from '@glimmer/component';
import { D3Config, CircleConfig, LineConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class LineWithCirclesChartDemoComponent extends Component {
  d3Config = new D3Config({
    dataConfig: {
      'Temperature A': {
        chartTypes: [
          new LineConfig({ lineWidth: 3, className: 'temperature-a-custom-styling' }),
          new CircleConfig({ radius: 5, lineWidth: 2, className: 'temperature-a-custom-styling' })
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
