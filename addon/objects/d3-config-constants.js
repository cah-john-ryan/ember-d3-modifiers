import { LineConfig } from 'ember-d3-modifiers/objects/d3-config-generators';
import moment from 'moment';

export {
  chartTypes,
  defaultGenericDataConfig,
  defaultLayoutConfig,
  defaultAxisConfig, defaultTimeSeriesAxisConfig,
  defaultLegendConfig,
  defaultTooltipConfig, defaultTimeSeriesTooltipConfig
}

const chartTypes = {
  circle: 'circle',
  line: 'line',
  bar: 'bar',
  area: 'area'
};

const defaultGenericDataConfig =
{
  chartTypes: [new LineConfig({ lineWidth: 1, className: null })]
};

const defaultLayoutConfig = {
  height: 400,
  width: 1000,
  // For the bottom margin remember that the axis, axis title, and legend are rendered there.
  margin: { top: 30, right: 160, bottom: 80, left: 60 }
};

const defaultAxisConfig = {
  x: {
    title: 'X Value',
    titleOffsetInPixels: 65,
    tickCount: 16, // The number of ticks D3 should present
    tickRotation: -45,
    tickOffsetInPixels: {
      x: -10,
      y: 5
    },
    startsAtZero: false,
    tickFormat: null // See: https://github.com/d3/d3-time-format ex. '%b %e, %I %p'
  },
  y: {
    title: 'Y Value',
    titleRotation: -90,
    titleOffsetInPixels: -35,
    tickCount: 10, // The number of ticks D3 should present
  }
};

// The time series should use different x and y axis titles as it is date based
let tempTimeSeriesAxisConfig = { x: {}, y: {} };
Object.assign(tempTimeSeriesAxisConfig.x, defaultAxisConfig.x, { title: 'Date' });
Object.assign(tempTimeSeriesAxisConfig.y, defaultAxisConfig.y, { title: 'Value' });
const defaultTimeSeriesAxisConfig = tempTimeSeriesAxisConfig;

const defaultLegendConfig = {
  yAxisOffsetInPixels: 80,
  placement: 'right' // 'bottom', 'right', 'none'
};

const defaultTooltipConfig = {
  enableVerticalLine: true,
  xAxisOffsetFromMouseLocation: 0,
  yAxisOffsetFromMouseLocation: 20,
  titlePresentationFormatFunction: (selectedXValue) => {
    return `Selected value: ${selectedXValue}`;
  },
  presentationFormatFunction: ({ seriesId, yValue }) => {
    return `${seriesId}: ${yValue.toFixed(2)}`;
  }
};

const defaultTimeSeriesTooltipConfig = Object.assign({}, defaultTooltipConfig, {
  titlePresentationFormatFunction: (selectedDate) => {
    return moment(selectedDate).format('MMMM DD, YYYY hh:mm A z');
  },
  presentationFormatFunction: ({ seriesId, value }) => {
    return `${seriesId}: ${value.toFixed(2)}`;
  }
});
