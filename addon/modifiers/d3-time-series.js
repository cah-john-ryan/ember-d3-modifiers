import Modifier from 'ember-modifier';
import { tracked } from '@glimmer/tracking';
import { dasherize } from '@ember/string';
import { action } from '@ember/object';
import * as d3 from 'd3';
import * as moment from 'moment';

export default class D3TimeSeriesModifier extends Modifier {
  didReceiveArguments() {
    this.loadD3Chart();
  }

  get height() {
    return this.d3Config.height - this.d3Config.margin.top - this.d3Config.margin.bottom;
  }
  get width() {
    return this.d3Config.width - this.d3Config.margin.left - this.d3Config.margin.right;
  }

  get d3Config() {
    return this.args.named.d3Config;
  }

  xScale = null;
  yScale = null;

  tooltipBoxOverlay = null;
  tooltipVerticalLine = null;
  tooltip = null;

  @tracked allXvalues = [];
  @tracked chartData = this.args.named.chartData;

  loadD3Chart() {
    const svg = this.createSvg();

    const thresholdSeriesData = this.thresholdLines;

    this.xScale = this.xScaleGenerator([].concat(this.chartData, ...thresholdSeriesData));
    this.yScale = this.yScaleGenerator([].concat(this.chartData, ...thresholdSeriesData));
    this.createXandYaxis(svg, this.xScale, this.yScale);

    this.args.named.renderData(svg, this.xScale, this.yScale, this.d3Config, this.chartData);

    this.tooltip = d3.select(this.element)
      .append('div')
      .attr('class', 'd3-tooltip d3-tooltip-hidden');
    this.tooltipVerticalLine = svg.append('line');
    this.tooltipBoxOverlay = svg.append('rect')
      .attr('width', this.d3Config.width)
      .attr('height', this.d3Config.height)
      .attr('opacity', 0)
      .on('mousemove', this.handleMouseMove)
      .on('mouseout', this.handleMouseOut);

    this.renderThresholdLines(svg, this.xScale, this.yScale, thresholdSeriesData);

    this.renderAxisLabels(svg);
  }

  createSvg() {
    return d3.select(this.element)
      .append('svg')
      .attr('width', this.d3Config.width)
      .attr('height', this.d3Config.height);
  }

  @action
  handleMouseMove() {
    const mouseLocation = d3.mouse(this.tooltipBoxOverlay.node())[0];
    const mouseLocationOnXaxis = this.xScale.invert(mouseLocation);
    let selectedDateOnXaxis = this.allXvalues[0];
    for (let i = 0; i < this.allXvalues.length; i++) {
      if (this.allXvalues[i] > mouseLocationOnXaxis) {
        break;
      }
      selectedDateOnXaxis = this.allXvalues[i];
    }

    this.tooltipVerticalLine.attr('stroke', 'black')
      .attr('x1', this.xScale(selectedDateOnXaxis))
      .attr('x2', this.xScale(selectedDateOnXaxis))
      .attr('y1', this.d3Config.margin.top)
      .attr('y2', this.d3Config.margin.top + this.height);

    const dataForSelectedDate = this.chartData
      .filter(d => selectedDateOnXaxis.getTime() === d.date.getTime())
      .sort(d => d.seriesId);

    this.tooltip.html(moment(selectedDateOnXaxis).format('MMMM DD, YYYY hh:mm A z'))
      .attr('class', 'd3-tooltip')
      .style('left', d3.event.pageX + 'px')
      .style('top', d3.event.pageY - this.d3Config.margin.top - 20 + 'px')
      .selectAll()
      .data(dataForSelectedDate)
      .enter()
      .append('div')
      .html(d => d.seriesId + ': ' + d.value);
  }

  @action
  handleMouseOut() {
    if (this.tooltip) this.tooltip.attr('class', 'd3-tooltip d3-tooltip-hidden').html('');
    if (this.tooltipVerticalLine) this.tooltipVerticalLine.attr('stroke', 'none');
  }

  get thresholdLines() {
    const { minDate, maxDate, setOfXvalues } = this.chartData.reduce((currentValues, temperatureReading) => {
      currentValues.minDate = currentValues.minDate > temperatureReading.date ? temperatureReading.date : currentValues.minDate;
      currentValues.maxDate = currentValues.maxDate < temperatureReading.date ? temperatureReading.date : currentValues.maxDate;
      currentValues.setOfXvalues.add(temperatureReading.date);
      return currentValues;
    }, { minDate: this.chartData[0].date, maxDate: this.chartData[0].date, setOfXvalues: new Set() });

    this.allXvalues = Array.from(setOfXvalues).sort();

    let thresholdSeriesData = [];
    if (this.d3Config.thresholds && this.d3Config.thresholds.length > 0) {
      this.d3Config.thresholds.forEach(threshold => {
        let thresholdData =
          [
            {
              seriesId: threshold.thresholdId,
              date: minDate,
              value: threshold.value
            },
            {
              seriesId: threshold.thresholdId,
              date: maxDate,
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
      .range([this.d3Config.margin.left, this.d3Config.width - this.d3Config.margin.right]);
  }

  yScaleGenerator(dataSeries) {
    return d3.scaleLinear()
      .domain(this.d3Config.startYaxisAtZero ? [0, d3.max(dataSeries, d => d.value)] : d3.extent(dataSeries, d => d.value))
      .range([this.d3Config.height - this.d3Config.margin.bottom, this.d3Config.margin.top]);
  }

  createXandYaxis(svg, xScale, yScale) {
    svg.append('g').call((g) => this.xAxis(g, xScale));
    svg.append('g').call((g) => this.yAxis(g, yScale));
  }

  xAxis(g, xScale) {
    return g.attr('transform', `translate(0,${this.d3Config.height - this.d3Config.margin.bottom})`).call(
      d3
        .axisBottom(xScale)
        .ticks(this.d3Config.axis.x.tickCount)
        .tickSizeOuter(0)
    );
  }

  yAxis(g, yScale) {
    return g.attr('transform', `translate(${this.d3Config.margin.left},0)`).call(
      d3
        .axisLeft(yScale)
        .ticks(this.d3Config.axis.y.tickCount)
        .tickSizeOuter(0)
    );
  }

  renderThresholdLines(svg, xScale, yScale, thresholdSeriesData) {
    var valueline = d3.line()
      .x(function (d) { return xScale(d.date); })
      .y(function (d) { return yScale(d.value); });

    if (thresholdSeriesData.length > 0) {
      thresholdSeriesData.forEach(thresholdData => {
        const thresholdDataSeriesIdDashCased = dasherize(thresholdData[0].seriesId);
        svg.append('path')
          .datum(thresholdData)
          .attr('class', thresholdDataSeriesIdDashCased)
          .attr('d', valueline);
      })
    }
  }

  renderAxisLabels(svg) {
    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', this.d3Config.margin.left + this.width / 2)
      .attr('y', this.height + this.d3Config.margin.top + this.d3Config.margin.bottom * 0.8)
      .text(this.d3Config.axis.x.title);

    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('y', this.d3Config.margin.left * 0.4)
      .attr('x', -this.height / 2 + this.d3Config.margin.bottom)
      .text(this.d3Config.axis.y.title);
  }
}
