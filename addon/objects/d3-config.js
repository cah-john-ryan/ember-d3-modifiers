import {
  chartTypes,
  defaultGenericDataConfig,
  defaultLayoutConfig,
  defaultAxisConfig, defaultTimeSeriesAxisConfig,
  defaultLegendConfig,
  defaultTooltipConfig, defaultTimeSeriesTooltipConfig, defaultPieChartAccessor, defaultPieChartLayoutConfig
} from 'ember-d3-modifiers/objects/d3-config-constants';

export { D3TimeSeriesConfig, D3PieChartConfig };

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
    if (!genericDataConfig) {
      genericDataConfig = {};
    }
    Object.assign(this.genericDataConfig, defaultGenericDataConfig, genericDataConfig);

    /** @member {object} A hash of seriesId's with their associated chartConfigs */
    this.dataConfig = dataConfig;

    /** @member {Array.} Threshold lines to be rendered
     * The data structure should have three properties: thresholdId, value, and className */
    this.thresholds = thresholds;

    /** @member {object} height, width, and margin settings */
    this.layout = { margin: {} };
    Object.assign(this.layout.margin, defaultLayoutConfig.margin);
    if (layout && layout.margin) {
      Object.assign(this.layout.margin, layout.margin);
    }
    Object.assign(this.layout, defaultLayoutConfig, layout);
    this.layout.heightWithinMargins = this.layout.height - this.layout.margin.top - this.layout.margin.bottom;
    this.layout.widthWithinMargins = this.layout.width - this.layout.margin.left - this.layout.margin.right;

    /** @member {object} x and y axis settings */
    this.axis = { x: {}, y: {} };
    Object.assign(this.axis.x, this instanceof D3TimeSeriesConfig ? defaultTimeSeriesAxisConfig.x : defaultAxisConfig.x);
    Object.assign(this.axis.y, this instanceof D3TimeSeriesConfig ? defaultTimeSeriesAxisConfig.y : defaultAxisConfig.y);
    if (axis && axis.x) {
      Object.assign(this.axis.x, axis.x);
    }
    if (axis && axis.y) {
      Object.assign(this.axis.y, axis.y);
    }

    /** @member {object} settings for rendering of the chart legend */
    this.legend = {};
    Object.assign(this.legend, defaultLegendConfig, legend);
    if (legend) {
      Object.assign(this.legend, legend);
    }

    /** @member {object} settings for rendering of tooltips */
    this.tooltip = {};
    Object.assign(this.tooltip, this instanceof D3TimeSeriesConfig ? defaultTimeSeriesTooltipConfig : defaultTooltipConfig, tooltip);
    if (tooltip) {
      Object.assign(this.tooltip, tooltip);
    }

    if (this.isAreaChartTypePresentInDataConfig()) {
      this.axis.y.startsAtZero = true;
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

class D3PieChartConfig {
  constructor({
                layout,
                accessor,
                generateToolTipHeader,
                generateToolTipContent
              } = {
    layout: {},
    accessor: {},
    generateToolTipHeader: () => {},
    generateToolTipContent: () => {}
  }) {
    /** @member {object} height, width settings */
    this.layout = {};
    Object.assign(this.layout, defaultPieChartLayoutConfig, layout);

    /** @member {object} define how the chart data should be accessed */
    this.accessor = {};
    Object.assign(this.accessor, defaultPieChartAccessor, accessor);

    /** @member {function} generate tooltip header */
    this.generateToolTipHeader = generateToolTipHeader;

    /** @member {function} generate tooltip content */
    this.generateToolTipContent = generateToolTipContent;
  }
}
