import * as d3 from 'd3';
import { action } from '@ember/object';
import { chartTypes } from 'ember-d3-modifiers';

export default class D3SeriesRenderer {
  initialize({
    svgElement,
    d3Config,
    getValueOnXaxis,
    getValueOnYaxis,
    lineGenerator,
    getClassesToApply }) {
    this.d3SvgElement = svgElement;
    this.d3Config = d3Config;
    this.getValueOnXaxis = getValueOnXaxis;
    this.getValueOnYaxis = getValueOnYaxis;
    this.lineGenerator = lineGenerator;
    this.getClassesToApply = getClassesToApply;
    return this;
  }

  get renderingFunctions() {
    const renderingFunctions = {};
    renderingFunctions[chartTypes.line] = this.renderLineData;
    renderingFunctions[chartTypes.bar] = this.renderBarData;
    renderingFunctions[chartTypes.area] = this.renderAreaData;
    renderingFunctions[chartTypes.circle] = this.renderCircleData;
    return renderingFunctions;
  }

  @action
  renderData(seriesIdListing, chartData) {
    let seriesNumber = 1;
    seriesIdListing.forEach(seriesId => {
      const seriesData = chartData.filter(d => d.seriesId === seriesId);
      const seriesConfig = this.d3Config.getSeriesConfig(seriesId);
      seriesConfig.seriesId = seriesId;
      seriesConfig.seriesNumber = seriesNumber;

      this.renderSeries(seriesConfig, seriesData);

      seriesNumber++;
    });
  }

  renderSeries(seriesConfig, seriesData) {
    seriesConfig.chartTypes.forEach(chartConfig => {
      const renderingFunctionForChart = this.renderingFunctions[chartConfig.chartType];
      if (renderingFunctionForChart) {
        renderingFunctionForChart.call(this, seriesData, seriesConfig, chartConfig);
      }
    });
  }

  renderLineData(seriesData, seriesConfig, chartConfig) {
    this.d3SvgElement.append('path')
      .datum(seriesData)
      .attr('class', this.getClassesToApply(seriesConfig, chartConfig))
      .attr('stroke', 'black')
      .attr('stroke-width', chartConfig.lineWidth)
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', this.lineGenerator());
  }

  renderBarData(seriesData, seriesConfig, chartConfig) {
    this.d3SvgElement.selectAll('whatever') // TODO: Validate that this is needed
      .data(seriesData)
      .enter()
      .append('rect')
      .attr('class', this.getClassesToApply(seriesConfig, chartConfig))
      .attr('stroke', 'black')
      .attr('stroke-width', chartConfig.lineWidth)
      .attr('x', d => this.getValueOnXaxis(d.date))
      .attr('y', d => this.getValueOnYaxis(d.value))
      .attr('width', chartConfig.barWidth)
      .attr('height', d => this.d3Config.layout.heightWithinMargins - this.getValueOnYaxis(d.value));
  }

  renderAreaData(seriesData, seriesConfig, chartConfig) {
    this.d3SvgElement.append('path')
      .datum(seriesData)
      .attr('class', this.getClassesToApply(seriesConfig, chartConfig))
      .attr('stroke', 'black')
      .attr('stroke-width', chartConfig.lineWidth)
      .attr('d', this.areaGenerator());
  }

  renderCircleData(seriesData, seriesConfig, chartConfig) {
    this.d3SvgElement.selectAll('whatever')
      .data(seriesData)
      .enter()
      .append('circle')
      .attr('class', this.getClassesToApply(seriesConfig, chartConfig))
      .attr('stroke', 'black')
      .attr('stroke-width', chartConfig.lineWidth)
      .attr('cx', d => this.getValueOnXaxis(d.date))
      .attr('cy', d => this.getValueOnYaxis(d.value))
      .attr('r', chartConfig.radius);
  }

  areaGenerator() {
    return d3.area()
      .x((d) => this.getValueOnXaxis(d.date))
      .y0(this.getValueOnYaxis(0))
      .y1((d) => this.getValueOnYaxis(d.value))
      .curve(d3.curveMonotoneX);
  }
}