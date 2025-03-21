import Modifier from "ember-modifier";
import * as d3 from "d3";
import { dasherize } from '@ember/string';
import { D3CategoricalSeriesConfig } from "ember-d3-modifiers";
import D3SeriesRenderer from 'ember-d3-modifiers/objects/d3-series-renderer';
import D3AxisRenderer from 'ember-d3-modifiers/objects/d3-axis-renderer';
import D3LegendRenderer from 'ember-d3-modifiers/objects/d3-legend-renderer';

export default class D3CategoricalSeriesModifier extends Modifier {
  didReceiveArguments() {
    this.d3SeriesRenderer = new D3SeriesRenderer();
    this.d3AxisRenderer = new D3AxisRenderer();
    this.d3LegendRenderer = new D3LegendRenderer();

    this.loadD3Chart();
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

  /** @member {object} The configuration settings to drive how the chart data should be rendered */
  get d3Config() {
    return !this.args.named.d3Config ? new D3CategoricalSeriesConfig() : this.args.named.d3Config;
  }

  loadD3Chart() {
    if (!this.svgElement) {
      this.svgElement = this.createSvg();
    }

    this.getValueOnXaxis = this.xScaleGenerator(this.svgElement, this.args.named.chartData);
    this.getValueOnYaxis = this.yScaleGenerator(this.svgElement, this.args.named.chartData);

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
      .renderData(this.seriesIdListing, this.args.named.chartData);
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

  xScaleGenerator(svg, chartData) {
    return d3
      .scaleBand()
      .domain(chartData.map(d => d.label))
      .range([0, this.d3Config.layout.widthWithinMargins])
      .padding(0.1);
  }

  yScaleGenerator(svg, chartData) {
    const maxValue = Math.max(1, d3.max(chartData, d => d.value));
    return d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([this.d3Config.layout.heightWithinMargins, 0]);
  }

  get seriesIdListing() {
    const seriesIdSet = this.args.named.chartData.reduce((listing, reading) => listing.add(reading.seriesId), new Set());
    return Array.from(seriesIdSet).sort();
  }

  getClassesToApply(seriesConfig, chartConfig) {
    return seriesConfig.className ?
      `${chartConfig.chartType} series-${seriesConfig.seriesNumber} ${dasherize(seriesConfig.seriesId)} ${seriesConfig.className}` :
      `${chartConfig.chartType} series-${seriesConfig.seriesNumber} ${dasherize(seriesConfig.seriesId)}`;
  }

  lineGenerator() {
    return d3
      .line()
      .x(d => this.getValueOnXaxis(d.label) + this.getValueOnXaxis.bandwidth() / 2)
      .y(d => this.getValueOnYaxis(d.value))
      .curve(d3.curveMonotoneX);
  }
}
