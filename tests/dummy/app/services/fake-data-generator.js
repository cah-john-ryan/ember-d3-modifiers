import Service from '@ember/service';
import moment from 'moment';

export default class FakeDataGeneratorService extends Service {
  generateFakeTimeSeriesData({ fakeSeriesIds, numberOfHoursAgo }) {
    let chartDataToRender = [];
    const seedTime = moment().add(-numberOfHoursAgo, 'hour');
    fakeSeriesIds.forEach(fakeSeriesId => {
      let fakeTimeSeries = this.generateFakeTimeSeries(fakeSeriesId, seedTime.clone(), numberOfHoursAgo);
      chartDataToRender.push(...fakeTimeSeries);
    });
    return chartDataToRender;
  }

  generateFakeGenericSeriesData({ fakeSeriesIds, numberOfIterations }) {
    let chartDataToRender = [];
    fakeSeriesIds.forEach(fakeSeriesId => {
      let fakeGenericSeries = this.generateFakeGenericSeries(fakeSeriesId, 1, numberOfIterations);
      chartDataToRender.push(...fakeGenericSeries);
    });
    return chartDataToRender;
  }

  // Taken from https://observablehq.com/@sdaas/d3-timeseries
  generateFakeTimeSeries(fakeSeriesId, seedTime, numberOfHoursAgo) {
    let data = [];
    let d = seedTime;
    for (let i = 0, v = 4; i < numberOfHoursAgo; ++i) {
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

  generateFakeGenericSeries(fakeSeriesId, seedValue, numberOfIterations) {
    let data = [];
    let x = seedValue;
    for (let i = 0, y = 4; i < numberOfIterations; ++i) {
      y += Math.random() - 0.5;
      y = i === 0 ? 4 : Math.max(Math.min(y, 8), 0);
      data.push({
        seriesId: fakeSeriesId,
        xValue: x,
        yValue: y
      });
      x++;
    }
    return data;
  }

  generateFakePieChart(numberOfIterations, accessor) {
    let data = [];
    for (let i = 0; i < numberOfIterations; ++i) {
      data.push({
        [accessor.label]: `fakeLabel ${i}`,
        [accessor.value]: Math.floor(Math.random() * 100) + 1,
      });
    }
    return data;
  }
}
