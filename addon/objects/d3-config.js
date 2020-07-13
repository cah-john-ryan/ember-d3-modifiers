export { chartTypes, LineConfig, BarConfig, AreaConfig, CircleConfig, D3TimeSeriesConfig };
import * as moment from 'moment';

export default class D3Config {
  constructor({
    genericDataConfig,
    dataConfig,
    thresholds,
    layout,
    axis,
    legend,
    tooltip
  } = {
      genericDataConfig: {},
      dataConfig: null,
      thresholds: [],
      layout: {},
      axis: {},
      legend: {},
      tooltip: {}
    }) {

    /** @member {object} The default chart configuration to be used in the event that the given
    seriesId is not registered in dataConfig */
    this.genericDataConfig = {};
    Object.assign(this.genericDataConfig, defaultGenericDataConfig, genericDataConfig ?? {});

    /** @member {object} A hash of seriesId's with their associated chartConfigs */
    this.dataConfig = dataConfig;

    /** @member {Array.} Threshold lines to be rendered
     * The data structure should have three properties: thresholdId, value, and className */
    this.thresholds = thresholds;

    /** @member {object} height, width, and margin settings */
    this.layout = { margin: {} };
    Object.assign(this.layout.margin, defaultLayoutConfig.margin, (!layout || layout.margin) ?? {});
    Object.assign(this.layout, defaultLayoutConfig, layout ?? {});
    this.layout.heightWithinMargins = this.layout.height - this.layout.margin.top - this.layout.margin.bottom;
    this.layout.widthWithinMargins = this.layout.width - this.layout.margin.left - this.layout.margin.right;

    /** @member {object} x and y axis settings */
    this.axis = { x: {}, y: {} };
    Object.assign(this.axis.x, this instanceof D3TimeSeriesConfig ? defaultTimeSeriesAxisConfig.x : defaultAxisConfig.x, (!axis || axis.x) ?? {});
    Object.assign(this.axis.y, this instanceof D3TimeSeriesConfig ? defaultTimeSeriesAxisConfig.y : defaultAxisConfig.y, (!axis || axis.y) ?? {});

    /** @member {object} settings for rendering of the chart legend */
    this.legend = {};
    Object.assign(this.legend, defaultLegendConfig, legend ?? {});

    /** @member {object} settings for rendering of tooltips */
    this.tooltip = {};
    Object.assign(this.tooltip, this instanceof D3TimeSeriesConfig ? defaultTimeSeriesTooltipConfig : defaultTooltipConfig, tooltip ?? {});

    if (this.isAreaChartTypePresentInDataConfig()) {
      this.axis.x.startsAtZero = true;
    }
  }

  isAreaChartTypePresentInDataConfig() {
    let result = false;
    if (this.genericDataConfig && this.genericDataConfig.chartTypes.some(c => c.chartType === chartTypes.area)) {
      result = true;
    }
    if (this.dataConfig) {
      Object.keys(this.dataConfig).forEach(dataConfigKey => {
        if (this.dataConfig[dataConfigKey].chartTypes.some(c => c.chartType === chartTypes.area)) {
          result = true;
        }
      });
    }
    return result;
  }

  getSeriesConfig(seriesId) {
    return this.dataConfig && this.dataConfig[seriesId] ?
      this.dataConfig[seriesId] :
      this.genericDataConfig;
  }
}

class D3TimeSeriesConfig extends D3Config {
  constructor({
    genericDataConfig,
    dataConfig,
    thresholds,
    layout,
    axis,
    legend,
    tooltip
  } = {
      genericDataConfig: defaultGenericDataConfig,
      dataConfig: null,
      thresholds: [],
      layout: defaultLayoutConfig,
      axis: defaultTimeSeriesAxisConfig,
      legend: defaultLegendConfig,
      tooltip: defaultTimeSeriesTooltipConfig
    }) {
    super({
      genericDataConfig,
      dataConfig,
      thresholds,
      layout,
      axis,
      legend,
      tooltip
    })
  }
}

const chartTypes = {
  circle: 'circle',
  line: 'line',
  bar: 'bar',
  area: 'area'
};

class LineConfig {
  constructor({ lineWidth }) {
    this.chartType = chartTypes.line;
    this.lineWidth = lineWidth;
  }
}
class BarConfig extends LineConfig {
  constructor({ barWidth, lineWidth }) {
    super({ lineWidth: lineWidth })
    this.chartType = chartTypes.bar;
    this.barWidth = barWidth;
  }
}
class AreaConfig extends LineConfig {
  constructor({ lineWidth }) {
    super({ lineWidth: lineWidth })
    this.chartType = chartTypes.area;
  }
}
class CircleConfig extends LineConfig {
  constructor({ radius, lineWidth }) {
    super({ lineWidth: lineWidth })
    this.chartType = chartTypes.circle;
    this.radius = radius;
  }
}

const defaultGenericDataConfig =
{
  chartTypes: [new LineConfig({ lineWidth: 1, className: null })]
}

const defaultLayoutConfig = {
  height: 400,
  width: 1000,
  // For the bottom margin remember that the axis, axis title, and legend are rendered there.
  margin: { top: 30, right: 160, bottom: 80, left: 60 }
};

const defaultTimeSeriesAxisConfig = {
  x: {
    title: 'Date',
    titleOffsetInPixels: 65,
    tickCount: 16,
    tickRotation: -45,
    tickOffsetInPixels: {
      x: -10,
      y: 5
    },
    startsAtZero: false,
    tickFormat: null // See: https://github.com/d3/d3-time-format ex. '%b %e, %I %p'
  },
  y: {
    title: 'Value',
    titleRotation: -90,
    titleOffsetInPixels: -35,
    tickCount: 10,
  }
};

const defaultAxisConfig = {
  x: {
    title: 'X Value',
    titleOffsetInPixels: 65,
    tickCount: 16,
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
    tickCount: 10,
  }
};

const defaultLegendConfig = {
  visible: true,
  yAxisOffsetInPixels: 80,
  placement: 'right' // 'bottom', 'right'
}

const defaultTooltipConfig = {
  enableVerticalLine: true,
  xAxisOffsetFromMouseLocation: 0,
  yAxisOffsetFromMouseLocation: -10,
  titlePresentationFormatFunction: (selectedXValue) => {
    return `Selected value: ${selectedXValue}`;
  },
  presentationFormatFunction: ({ seriesId, yValue }) => {
    return `${seriesId}: ${yValue.toFixed(2)}`;
  }
};

const defaultTimeSeriesTooltipConfig = {
  enableVerticalLine: true,
  xAxisOffsetFromMouseLocation: 0,
  yAxisOffsetFromMouseLocation: -10,
  titlePresentationFormatFunction: (selectedXValue) => {
    return moment(selectedXValue).format('MMMM DD, YYYY hh:mm A z');
  },
  presentationFormatFunction: ({ seriesId, value }) => {
    return `${seriesId}: ${value.toFixed(2)}`;
  }
};