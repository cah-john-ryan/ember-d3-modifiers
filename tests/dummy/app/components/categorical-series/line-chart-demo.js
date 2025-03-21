import Component from '@glimmer/component';
import {  CircleAndToolTipConfig, LineConfig, D3CategoricalSeriesConfig } from 'ember-d3-modifiers';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class CategoricalSeriesLineChartComponent extends Component {
  d3Config = new D3CategoricalSeriesConfig({
    dataConfig: {
      'Series A': {
        className: 'series-a-custom-styling',
        chartTypes: [
          new LineConfig({ lineWidth: 3 }),
          new CircleAndToolTipConfig({ radius: 4, lineWidth: 2, presentationFormatFunction: this.generateTooltipHtml })
        ],
      },
    },
    legend: {
      placement: "right"
    },
    axis: {
      x: {
        title: "Dates",
        fontSize: "10px",
        tickSize: "7px",
      },
      y: {
        title: "Orders",
        fontSize: "10px",
        tickFormat: this.yTickFormatCustom,
        tickCount: 5,
        ticketSize: "10px",
      },
    },
  });

  yTickFormatCustom(d) {
    return Number.isInteger(d) ? d : '';
  }

  @action
  generateTooltipHtml(data) {
    return `
    <div>
      <strong>${this.formatDateToWeek(data.label)}<br>
      <strong>${data.count > 1 ? 'Orders' : 'Order'}:</strong> ${data.value}<br>
    </div>
  `;
  }

  formatDateToWeek = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(parseInt(year), parseInt(month - 1), parseInt(day)); // Create date in UTC
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const [monthName, dayNumber, yearNumber] = formattedDate.split(' ');
    return `Week of ${monthName} ${parseInt(dayNumber)}, ${yearNumber}`;
  }


  @service fakeDataGenerator;
  get chartData() {
    return this.fakeDataGenerator.generateFakeCategoricalSeries(['Series A'], 50, '2025-01-01');
  }
}
