import Component from '@glimmer/component';
import { action } from '@ember/object';
import { dasherize } from '@ember/string';
import * as moment from 'moment';

export default class D3TimeSeriesComponent extends Component {
  d3Config = {
    height: 400,
    width: 900,
    margin: { top: 30, right: 30, bottom: 50, left: 50 },
    axis: {
      x: {
        title: 'Date',
        tickCount: 16
      },
      y: {
        title: 'Temperature (°C)',
        tickCount: 10,
      }
    },
    elementSize: 3,
    thresholds: [
      { thresholdId: 'High Temperature Value', value: 6 },
      { thresholdId: 'Low Temperature Value', value: 2 }
    ]
  };

  fakeSeriesIds = ['Temperature A', 'Temperature B', 'Temperature C'];

  get chartData() {
    let chartDataToRender = [];
    const seedTime = moment().add(-48, 'hour');
    this.fakeSeriesIds.forEach(fakeSeriesId => {
      let fakeTimeSeries = this.generateFakeTimeSeries(fakeSeriesId, seedTime.clone());
      chartDataToRender.push(...fakeTimeSeries);
    });
    return chartDataToRender;
  }

  generateFakeTimeSeries(fakeSeriesId, seedTime) {
    let data = [];
    let d = seedTime;
    for (let i = 0, v = 4; i < 48; ++i) {
      v += Math.random() - 0.5;
      v = i === 0 ? 4 : Math.max(Math.min(v, 8), 0);
      data.push({
        seriesId: fakeSeriesId,
        date: d.toDate(),
        value: v
      });

      d = d.add(1, 'hour');
    }
    return data;
  }

  @action
  renderData(svg, xScale, yScale, d3Config, dataToRender) {
    let seriesNumber = 1;
    this.getSeriesIdListing(dataToRender).forEach(seriesId => {
      const seriesData = dataToRender.filter(d => d.seriesId === seriesId);
      svg.selectAll('whatever')
        .data(seriesData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', d3Config.elementSize)
        .attr('class', `dot series-${seriesNumber++} ${dasherize(seriesId)}`);
    });
  }

  getSeriesIdListing(dataToRender) {
    return dataToRender.reduce((listing, temperatureReading) => {
      if (!listing.includes(temperatureReading.seriesId)) {
        listing.push(temperatureReading.seriesId);
      }
      return listing;
    }, []);
  }
}
