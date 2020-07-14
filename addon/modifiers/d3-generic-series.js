import Modifier from 'ember-modifier';
import { tracked } from '@glimmer/tracking';
import { dasherize } from '@ember/string';
import * as d3 from 'd3';
import D3LegendRenderer from 'ember-d3-modifiers/objects/d3-legend-renderer';
import D3SeriesRenderer from 'ember-d3-modifiers/objects/d3-series-renderer';
import D3TooltipRenderer from 'ember-d3-modifiers/objects/d3-tooltip-renderer';
import D3AxisRenderer from 'ember-d3-modifiers/objects/d3-axis-renderer';
import { D3Config } from 'ember-d3-modifiers/objects/d3-config';

//TODO: Need to square this away
export default class D3GenericSeriesModifier extends Modifier {
  didReceiveArguments() {
    this.d3SeriesRenderer = new D3SeriesRenderer();
    this.d3LegendRenderer = new D3LegendRenderer();
    this.d3TooltipRenderer = new D3TooltipRenderer();
    this.d3AxisRenderer = new D3AxisRenderer();
    this.loadD3Chart();
  }

  /** @member {Array.} The source data that is to be rendered
   * The data structure should have three properties: seriesId, xValue, and yValue */
  @tracked chartData = this.args.named.chartData;

  /** @member {object} The configuration settings to drive how the chart data should be rendered */
  get d3Config() {
    return this.args.named.d3Config ?? new D3Config();
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
  @tracked allXvalues = [];

  loadD3Chart() {
    this.svgElement = this.createSvg();
    this.d3LegendRenderer.d3SvgElement = this.svgElement;


    const { minXvalue, maxXvalue, setOfXvalues } = this.assessChartDataProvided();
    const thresholdSeriesData = this.thresholdLines(minXvalue, maxXvalue);
    this.allXvalues = Array.from(setOfXvalues).sort((a, b) => Number(a) > Number(b));

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
      allXvalues: this.allXvalues,
      getValueOnXaxis: this.getValueOnXaxis,
    })
      .renderTooltipElementsWithMouseEvents(this.element);
  }

  createSvg() {
    return d3.select(this.element)
      .append('svg')
      .attr('width', this.d3Config.layout.width)
      .attr('height', this.d3Config.layout.height)
      .append('g')
      .attr('transform', `translate(${this.d3Config.layout.margin.left},${this.d3Config.layout.margin.top})`);
  }

  assessChartDataProvided() {
    return this.chartData.reduce((currentValues, chartElement) => {
      currentValues.minXvalue = currentValues.minXvalue > chartElement.xValue ? chartElement.xValue : currentValues.minXvalue;
      currentValues.maxXvalue = currentValues.maxXvalue < chartElement.xValue ? chartElement.xValue : currentValues.maxXvalue;
      currentValues.setOfXvalues.add(chartElement.xValue);
      return currentValues;
    }, { minXvalue: this.chartData[0].xValue, maxXvalue: this.chartData[0].xValue, setOfXvalues: new Set() });
  }

  thresholdLines(minXvalue, maxXvalue) {
    let thresholdSeriesData = [];
    if (this.d3Config.thresholds && this.d3Config.thresholds.length > 0) {
      this.d3Config.thresholds.forEach(threshold => {
        let thresholdData =
          [
            {
              seriesId: threshold.thresholdId,
              xValue: minXvalue,
              yValue: threshold.value
            },
            {
              seriesId: threshold.thresholdId,
              xValue: maxXvalue,
              yValue: threshold.value
            }
          ];
        thresholdSeriesData.push(thresholdData);
      })
    }
    return thresholdSeriesData;
  }

  xScaleGenerator(dataSeries) {
    return d3.scaleLinear()
      .domain(d3.extent(dataSeries, d => d.xValue))
      .range([0, this.d3Config.layout.widthWithinMargins]);
  }

  yScaleGenerator(dataSeries) {
    return d3.scaleLinear()
      .domain(this.d3Config.axis.x.startsAtZero ?
        [0, d3.max(dataSeries, d => d.yValue)] :
        d3.extent(dataSeries, d => d.yValue))
      .range([this.d3Config.layout.heightWithinMargins, 0]);
  }

  lineGenerator() {
    return d3.line()
      .x((d) => this.getValueOnXaxis(d.xValue))
      .y((d) => this.getValueOnYaxis(d.yValue))
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
    if (thresholdSeriesData.length > 0) {
      thresholdSeriesData.forEach(thresholdData => {
        const thresholdConfig = this.d3Config.thresholds.find(threshold => threshold.thresholdId === thresholdData[0].seriesId);
        const classNamesToApply = thresholdConfig.className ? `${dasherize(thresholdData[0].seriesId)} ${thresholdConfig.className}` : `${dasherize(thresholdData[0].seriesId)}`;
        this.svgElement.append('path')
          .datum(thresholdData)
          .attr('class', classNamesToApply)
          .attr('d', this.lineGenerator());
      })
    }
  }
}
