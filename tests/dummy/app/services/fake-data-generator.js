import Service from '@ember/service';
import * as moment from 'moment';

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
}
