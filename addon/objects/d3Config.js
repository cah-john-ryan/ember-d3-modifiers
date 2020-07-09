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
export { chartTypes, LineConfig, BarConfig, AreaConfig, CircleConfig };

const defaultGenericDataConfig =
{
  chartTypes: [new LineConfig({ lineWidth: 1, className: null })]
}

//TODO: Need config settings for the legend
export default class D3Config {
  constructor({ genericDataConfig, dataConfig, thresholds } = { genericDataConfig: defaultGenericDataConfig, dataConfig: null, thresholds: [] }) {

    /** @member {object} The default chart configuration to be used in the event that the given
    seriesId is not registered in dataConfig */
    this.genericDataConfig = genericDataConfig ? genericDataConfig : defaultGenericDataConfig;

    /** @member {object} A hash of seriesId's with their associated chartConfigs */
    this.dataConfig = dataConfig;

    /** @member {Array.} Threshold lines to be rendered
     * The data structure should have three properties: thresholdId, value, and className */
    this.thresholds = thresholds;

    if (this.isAreaChartTypePresentInDataConfig()) {
      this.startYaxisAtZero = true;
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

  // Properties that can be set ad-hoc should you want to override them.

  height = 400;
  width = 900;
  // For the bottom margin remember that the axis, axis title, and legend are rendered there.
  margin = { top: 30, right: 30, bottom: 110, left: 60 };
  axis = {
    x: {
      title: 'Date',
      titleOffsetInPixels: 65,
      tickCount: 16,
      // tickFormat: '%b %e, %I %p' // See: https://github.com/d3/d3-time-format
    },
    y: {
      title: 'Temperature (°C)',
      titleOffsetInPixels: 35,
      tickCount: 10,
    }
  };
  tooltip = {
    enableVerticalLine: true,
    presentationFormatFunction: ({ seriesId, value }) => {
      return `${seriesId}: ${value}`;
    }
  }
  legend = {
    visible: true,
    yAxisOffsetInPixels: 80
  }
}
