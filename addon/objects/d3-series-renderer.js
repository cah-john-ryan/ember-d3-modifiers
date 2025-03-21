import * as d3 from 'd3';
import { action } from '@ember/object';
import { chartTypes } from 'ember-d3-modifiers';

export default class D3SeriesRenderer {
  initialize({
    svgElement,
    element,
    d3Config,
    getValueOnXaxis,
    getValueOnYaxis,
    lineGenerator,
    getClassesToApply }) {
    this.d3SvgElement = svgElement;
    this.element = element;
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
    renderingFunctions[chartTypes.circleAndTooltip] = this.renderCircleAndTooltipData;

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
    this.d3SvgElement.selectAll()
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
    this.d3SvgElement.selectAll()
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

  renderCircleAndTooltipData(seriesData, seriesConfig, chartConfig) {
    const tooltip = d3.select(this.element)
      .append("div")
      .style("position", "absolute")
      .attr('class', 'd3-tooltip')
      .style('display', 'none')
      .style('width', 'max-content')
      .style("padding", "5px")
      .style("pointer-events", "none");

    this.d3SvgElement.selectAll(`circle.series-${seriesConfig.seriesNumber}`)
      .data(seriesData)
      .enter()
      .append("circle")
      .attr('class', `series-${seriesConfig.seriesNumber} ${this.getClassesToApply(seriesConfig, chartConfig)}`)
      .attr('stroke', 'black')
      .attr('stroke-width', chartConfig.lineWidth)
      .attr('r', chartConfig.radius)
      .style("cursor", "pointer")
      .attr("cx", d => this.getValueOnXaxis(d.label) + this.getValueOnXaxis.bandwidth() / 2)
      .attr("cy", d => this.getValueOnYaxis(d.value));

    if (chartConfig.presentationFormatFunction) {
      this.d3SvgElement.selectAll(`circle.series-${seriesConfig.seriesNumber}`)
        .on("mouseover", (d) => {
          tooltip
            .html(chartConfig.presentationFormatFunction(d))
            .style('display', 'block')
            .style('left', (d3.event.offsetX + 10) + 'px')
            .style('top', (d3.event.offsetY + 10) + 'px');
        })
        .on("mouseout", () => {
          tooltip.style("display", 'none');
        });
    }
  }

  areaGenerator() {
    return d3.area()
      .x((d) => this.getValueOnXaxis(d.date))
      .y0(this.getValueOnYaxis(0))
      .y1((d) => this.getValueOnYaxis(d.value))
      .curve(d3.curveMonotoneX);
  }
}
