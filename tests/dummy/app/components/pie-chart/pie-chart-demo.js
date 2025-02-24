import Component from '@glimmer/component';
import { D3PieChartConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';

export default class PieChartComponent extends Component {
  d3Config = new D3PieChartConfig({
    /* define the layout of the chart */
    layout: {
      width: 400,
      height: 400
    },
    /* define how the chart data should be accessed
    * label: accessor for the label of the data
    * value: accessor for the value of the data
    * color (optional): accessor for the color of the data
    * */
    accessor: {
      label: d => d['physician'],
      value: d => d['appointment']
    },
    /* define how the tooltip header should be rendered */
    generateToolTipHeader: this.getToolTipHeader,

    /* define how the tooltip content should be rendered */
    generateToolTipContent: this.getToolTipContent
  });

  getToolTipHeader(data) {
    return `Label: ${data}`;
  }

  getToolTipContent(data) {
    return `Value: ${data}`;
  }

  @service fakeDataGenerator;

  get chartData() {
    return this.fakeDataGenerator.generateFakePieChart(10, {label: 'physician', value: 'appointment'});
  }
}
