import Modifier from 'ember-modifier';
import { tracked } from '@glimmer/tracking';
import { dasherize } from '@ember/string';
import * as d3 from 'd3';
import D3LegendRenderer from 'ember-d3-modifiers/objects/d3-legend-renderer';
import D3SeriesRenderer from 'ember-d3-modifiers/objects/d3-series-renderer';
import D3TooltipRenderer from 'ember-d3-modifiers/objects/d3-tooltip-renderer';
import D3AxisRenderer from 'ember-d3-modifiers/objects/d3-axis-renderer';
import { D3TimeSeriesConfig } from 'ember-d3-modifiers/objects/d3-config';

export default class D3TimeSeriesModifier extends Modifier {
  didReceiveArguments() {
    this.d3SeriesRenderer = new D3SeriesRenderer();
    this.d3LegendRenderer = new D3LegendRenderer();
    this.d3TooltipRenderer = new D3TooltipRenderer();
    this.d3AxisRenderer = new D3AxisRenderer();
    this.loadD3Chart();
  }

  /** @member {Array.} The source data that is to be rendered
   * The data structure should have three properties: seriesId, date, and value */
  @tracked chartData = this.args.named.chartData;

  /** @member {Array.} Optional threshold data that is to be rendered
   * The data structure should have these properties: thresholdId and value */
  @tracked thresholdConfig = this.args.named.thresholdConfig;

  /** @member {object} The configuration settings to drive how the chart data should be rendered */
  get d3Config() {
    return !this.args.named.d3Config ? new D3TimeSeriesConfig() : this.args.named.d3Config;
  }

  /** @member {object} The svg tag that D3 renders in the markup */
  svgElement;

  /**
  * Get the x value (in pixels) from the date provided
  * @function
  */
  getValueOnXaxis;

  /**
   * Get the y value (in pixels) from the value provided
   * @function
   */
  getValueOnYaxis;

  /** @member {Array.} All date values in the source data to help with xAxis mapping in the tooltip placement logic */
  @tracked allDateValues = [];
  minDate = null;
  maxDate = null;

  loadD3Chart() {
    if (this.svgElement) {
      const thresholdSeriesData = this.thresholdLines();
      this.renderThresholdLines(thresholdSeriesData);
      return;
    }
    this.svgElement = this.createSvg();
    this.d3LegendRenderer.d3SvgElement = this.svgElement;


    const { minDate, maxDate, setOfXvalues } = this.assessChartDataProvided();
    this.minDate = minDate;
    this.maxDate = maxDate;
    const thresholdSeriesData = this.thresholdLines();
    this.allDateValues = Array.from(setOfXvalues).sort((a, b) => a.getTime() > b.getTime());

    this.getValueOnXaxis = this.xScaleGenerator([].concat(this.chartData, ...thresholdSeriesData));
    this.getValueOnYaxis = this.yScaleGenerator([].concat(this.chartData, ...thresholdSeriesData));

    this.d3AxisRenderer.initialize({
      svgElement: this.svgElement,
      d3Config: this.d3Config,
      getValueOnXaxis: this.getValueOnXaxis,
      getValueOnYaxis: this.getValueOnYaxis,
    })
      .renderXandYaxis()
      .renderAxisLabels();

    this.d3LegendRenderer.initialize({
      svgElement: this.svgElement,
      d3Config: this.d3Config,
      getClassesToApply: this.getClassesToApply
    })
      .renderLegend(this.seriesIdListing);

    this.d3SeriesRenderer.initialize({
      svgElement: this.svgElement,
      element: this.element,
      d3Config: this.d3Config,
      getValueOnXaxis: this.getValueOnXaxis,
      getValueOnYaxis: this.getValueOnYaxis,
      lineGenerator: this.lineGenerator,
      getClassesToApply: this.getClassesToApply
    })
      .renderData(this.seriesIdListing, this.chartData);

    this.renderThresholdLines(thresholdSeriesData);

    this.d3TooltipRenderer.initialize({
      svgElement: this.svgElement,
      chartData: this.chartData,
      d3Config: this.d3Config,
      allXvalues: this.allDateValues,
      getValueOnXaxis: this.getValueOnXaxis,
    })
      .renderTooltipElementsWithMouseEvents(this.element);
  }

  createSvg() {
    d3.select(this.element).style('position', 'relative');

    return d3.select(this.element)
      .append('svg')
      .attr('width', this.d3Config.layout.width)
      .attr('height', this.d3Config.layout.height)
      .append('g')
      .attr('transform', `translate(${this.d3Config.layout.margin.left},${this.d3Config.layout.margin.top})`);
  }

  assessChartDataProvided() {
    return this.chartData.reduce((currentValues, chartElement) => {
      currentValues.minDate = currentValues.minDate > chartElement.date ? chartElement.date : currentValues.minDate;
      currentValues.maxDate = currentValues.maxDate < chartElement.date ? chartElement.date : currentValues.maxDate;
      currentValues.setOfXvalues.add(chartElement.date);
      return currentValues;
    }, { minDate: this.chartData[0].date, maxDate: this.chartData[0].date, setOfXvalues: new Set() });
  }

  thresholdLines() {
    let thresholdSeriesData = [];
    if (this.thresholdConfig && this.thresholdConfig.length > 0) {
      this.thresholdConfig.forEach(threshold => {
        let thresholdData =
          [
            {
              seriesId: threshold.thresholdId,
              date: this.minDate,
              value: threshold.value
            },
            {
              seriesId: threshold.thresholdId,
              date: this.maxDate,
              value: threshold.value
            }
          ];
        thresholdSeriesData.push(thresholdData);
      })
    }
    return thresholdSeriesData;
  }

  xScaleGenerator(dataSeries) {
    return d3.scaleTime()
      .domain(d3.extent(dataSeries, d => d.date))
      .range([0, this.d3Config.layout.widthWithinMargins]);
  }

  yScaleGenerator(dataSeries) {
    return d3.scaleLinear()
      .domain(this.d3Config.axis.y.startsAtZero ?
        [0, d3.max(dataSeries, d => d.value)] :
        d3.extent(dataSeries, d => d.value))
      .range([this.d3Config.layout.heightWithinMargins, 0]);
  }

  lineGenerator() {
    return d3.line()
      .x((d) => this.getValueOnXaxis(d.date))
      .y((d) => this.getValueOnYaxis(d.value))
      .curve(d3.curveMonotoneX);
  }

  get seriesIdListing() {
    const seriesIdSet = this.chartData.reduce((listing, reading) => listing.add(reading.seriesId), new Set());
    return Array.from(seriesIdSet).sort();
  }

  getClassesToApply(seriesConfig, chartConfig) {
    return seriesConfig.className ?
      `${chartConfig.chartType} series-${seriesConfig.seriesNumber} ${dasherize(seriesConfig.seriesId)} ${seriesConfig.className}` :
      `${chartConfig.chartType} series-${seriesConfig.seriesNumber} ${dasherize(seriesConfig.seriesId)}`;
  }

  renderThresholdLines(thresholdSeriesData) {
    this.svgElement.selectAll('path.threshold-line').remove()
    if (thresholdSeriesData.length > 0) {
      thresholdSeriesData.forEach(thresholdData => {
        const thresholdConfig = this.thresholdConfig.find(threshold => threshold.thresholdId === thresholdData[0].seriesId);
        const seriesIdAsClassName = dasherize(thresholdData[0].seriesId);
        const classNamesToApply = thresholdConfig.className ? `threshold-line ${seriesIdAsClassName} ${thresholdConfig.className}` : `threshold-line ${seriesIdAsClassName}`;

        this.svgElement.append('path')
          .datum(thresholdData)
          .attr('class', classNamesToApply)
          .attr('d', this.lineGenerator());
      })
    }
  }
}
