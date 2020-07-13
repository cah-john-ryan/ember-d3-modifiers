import Component from '@glimmer/component';
import { D3Config, LineConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class GenericSeriesLineChartDemoComponent extends Component {
  d3Config = new D3Config({
    dataConfig: {
      'Series A': {
        className: 'series-a-custom-styling',
        chartTypes: [
          new LineConfig({ lineWidth: 3 })
        ]
      },
      'Series B': {
        className: 'series-b-custom-styling',
        chartTypes: [
          new LineConfig({ lineWidth: 5 })
        ]
      }
    }
  });
  @service fakeDataGenerator;
  get chartData() {
    return this.fakeDataGenerator.generateFakeGenericSeriesData({
      fakeSeriesIds: ['Series A', 'Series B'],
      numberOfIterations: 50
    });
  }
}
