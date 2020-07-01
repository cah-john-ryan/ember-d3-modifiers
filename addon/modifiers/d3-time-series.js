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

  get heightWithinMargins() {
    return this.d3Config.height - this.d3Config.margin.top - this.d3Config.margin.bottom;
  }
  get widthWithinMargins() {
    return this.d3Config.width - this.d3Config.margin.left - this.d3Config.margin.right;
  }

  get d3Config() {
    return this.args.named.d3Config;
  }

  @tracked chartData = this.args.named.chartData;

  svgElement = null;
  getValueOnXaxis = () => { return null; }; // Get the x value (in pixels) from the date provided
  getValueOnYaxis = () => { return null; }; // Get the y value (in pixels) from the value provided

  tooltipBoxOverlay = null; // A full overlay of the chart to detect mouse movement for tooltip rendering
  tooltipVerticalLine = null; // A vertical line indicator to show the date current selected by the location of the mouse
  tooltipElement = null; // The tooltip that gets rendered on top of the svg d3 chart
  @tracked allDateValues = []; // All date values in the source data to help with mapping in the tooltip logic

  loadD3Chart() {
    this.d3Config.defaultDataConfig = this.d3Config.defaultDataConfig ?? {
      chartType: 'line',
      circleSize: 3,
      lineSize: 2,
      barWidth: 10
    };
    if (this.d3Config.defaultChartType === 'area') {
      this.d3Config.startYaxisAtZero = true;
    }
    this.svgElement = this.createSvg();

    const thresholdSeriesData = this.thresholdLines;

    this.getValueOnXaxis = this.xScaleGenerator([].concat(this.chartData, ...thresholdSeriesData));
    this.getValueOnYaxis = this.yScaleGenerator([].concat(this.chartData, ...thresholdSeriesData));
    this.renderXandYaxis();
    this.renderAxisLabels();

    this.renderThresholdLines(thresholdSeriesData);

    this.renderData();

    this.renderTooltipElements();
  }

  renderTooltipElements() {
    this.tooltipElement = d3.select(this.element)
      .append('div')
      .attr('class', 'd3-tooltip d3-tooltip-hidden');
    this.tooltipVerticalLine = this.svgElement.append('line');
    this.tooltipBoxOverlay = this.svgElement.append('rect')
      .attr('width', this.d3Config.width)
      .attr('height', this.d3Config.height)
      .attr('opacity', 0)
      .on('mousemove', this.handleMouseMove)
      .on('mouseout', this.handleMouseOut);
  }

  createSvg() {
    return d3.select(this.element)
      .append('svg')
      .attr('width', this.d3Config.width)
      .attr('height', this.d3Config.height)
      .append("g")
      .attr("transform", `translate(${this.d3Config.margin.left},${this.d3Config.margin.top})`);
  }

  get thresholdLines() {
    const { minDate, maxDate, setOfXvalues } = this.chartData.reduce((currentValues, temperatureReading) => {
      currentValues.minDate = currentValues.minDate > temperatureReading.date ? temperatureReading.date : currentValues.minDate;
      currentValues.maxDate = currentValues.maxDate < temperatureReading.date ? temperatureReading.date : currentValues.maxDate;
      currentValues.setOfXvalues.add(temperatureReading.date);
      return currentValues;
    }, { minDate: this.chartData[0].date, maxDate: this.chartData[0].date, setOfXvalues: new Set() });

    this.allDateValues = Array.from(setOfXvalues).sort();

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
      .range([0, this.widthWithinMargins]);
  }

  yScaleGenerator(dataSeries) {
    return d3.scaleLinear()
      .domain(this.d3Config.startYaxisAtZero ? [0, d3.max(dataSeries, d => d.value)] : d3.extent(dataSeries, d => d.value))
      .range([this.heightWithinMargins, 0]);
  }

  lineGenerator() {
    return d3.line()
      .x((d) => this.getValueOnXaxis(d.date))
      .y((d) => this.getValueOnYaxis(d.value))
      .curve(d3.curveMonotoneX);
  }

  areaGenerator() {
    return d3.area()
      .x((d) => this.getValueOnXaxis(d.date))
      .y0(this.getValueOnYaxis(0))
      .y1((d) => this.getValueOnYaxis(d.value));
  }

  renderXandYaxis() {
    this.svgElement.append('g').call((g) => this.renderXaxis(g, this.getValueOnXaxis));
    this.svgElement.append('g').call((g) => this.renderYaxis(g, this.getValueOnYaxis));
  }

  renderXaxis(g) {
    return g.attr('transform', `translate(0, ${this.heightWithinMargins})`).call(
      d3
        .axisBottom(this.getValueOnXaxis)
        .ticks(this.d3Config.axis.x.tickCount)
        .tickSizeOuter(0)
    );
  }

  renderYaxis(g) {
    return g.call(
      d3
        .axisLeft(this.getValueOnYaxis)
        .ticks(this.d3Config.axis.y.tickCount)
        .tickSizeOuter(0)
    );
  }

  @action
  renderData() {
    let seriesNumber = 1;
    this.getSeriesIdListing(this.chartData).forEach(seriesId => {
      const seriesData = this.chartData.filter(d => d.seriesId === seriesId);
      const dataConfig = this.d3Config.dataConfig && this.d3Config.dataConfig[seriesId] ? this.d3Config.dataConfig[seriesId] : this.d3Config.defaultDataConfig;
      if (dataConfig.chartType.includes('circle')) {
        this.svgElement.selectAll('whatever')
          .data(seriesData)
          .enter()
          .append('circle')
          .attr('cx', d => this.getValueOnXaxis(d.date))
          .attr('cy', d => this.getValueOnYaxis(d.value))
          .attr('r', dataConfig.circleSize)
          .attr('class', `circle series-${seriesNumber} ${dasherize(seriesId)}`);
      }
      if (dataConfig.chartType.includes('line')) {
        this.svgElement.append('path')
          .datum(seriesData)
          .attr('class', `line series-${seriesNumber} ${dasherize(seriesId)}`)
          .attr('fill', 'none')
          .attr('stroke', 'black')
          .attr('stroke-width', dataConfig.lineSize)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('d', this.lineGenerator());
      }
      if (dataConfig.chartType.includes('bar')) {
        this.svgElement.selectAll('whatever')
          .data(seriesData)
          .enter()
          .append('rect')
          .attr('x', d => this.getValueOnXaxis(d.date))
          .attr('y', d => this.getValueOnYaxis(d.value))
          .attr('width', dataConfig.barWidth)
          .attr('height', d => this.d3Config.margin.top + this.heightWithinMargins - this.getValueOnYaxis(d.value))
          .attr('class', `bar series-${seriesNumber} ${dasherize(seriesId)}`);
      }
      if (dataConfig.chartType.includes('area')) {
        this.svgElement.append('path')
          .datum(seriesData)
          .attr('class', `area series-${seriesNumber} ${dasherize(seriesId)}`)
          .attr('d', this.areaGenerator());
      }

      seriesNumber++;
    });
  }

  getSeriesIdListing() {
    return this.chartData.reduce((listing, temperatureReading) => {
      if (!listing.includes(temperatureReading.seriesId)) {
        listing.push(temperatureReading.seriesId);
      }
      return listing;
    }, []);
  }

  @action
  handleMouseMove() {
    const mouseLocation = d3.mouse(this.tooltipBoxOverlay.node())[0];
    const mouseLocationOnXaxis = this.getValueOnXaxis.invert(mouseLocation);
    let selectedDateOnXaxis = this.allDateValues[0];
    for (let i = 0; i < this.allDateValues.length; i++) {
      if (this.allDateValues[i] > mouseLocationOnXaxis) {
        break;
      }
      selectedDateOnXaxis = this.allDateValues[i];
    }

    this.tooltipVerticalLine.attr('stroke', 'black')
      .attr('x1', this.getValueOnXaxis(selectedDateOnXaxis))
      .attr('x2', this.getValueOnXaxis(selectedDateOnXaxis))
      .attr('y1', this.d3Config.margin.top)
      .attr('y2', this.d3Config.margin.top + this.heightWithinMargins);

    const dataForSelectedDate = this.chartData
      .filter(d => selectedDateOnXaxis.getTime() === d.date.getTime())
      .sort(d => d.seriesId);

    this.tooltipElement.html(moment(selectedDateOnXaxis).format('MMMM DD, YYYY hh:mm A z'))
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
    if (this.tooltipElement) this.tooltipElement.attr('class', 'd3-tooltip d3-tooltip-hidden').html('');
    if (this.tooltipVerticalLine) this.tooltipVerticalLine.attr('stroke', 'none');
  }

  renderThresholdLines(thresholdSeriesData) {
    if (thresholdSeriesData.length > 0) {
      thresholdSeriesData.forEach(thresholdData => {
        const thresholdDataSeriesIdDashCased = dasherize(thresholdData[0].seriesId);
        this.svgElement.append('path')
          .datum(thresholdData)
          .attr('class', thresholdDataSeriesIdDashCased)
          .attr('d', this.lineGenerator());
      })
    }
  }

  renderAxisLabels() {
    this.svgElement.append('text')
      .attr('class', 'x-axis-label')
      .attr('transform', `translate(${this.widthWithinMargins / 2}, ${this.heightWithinMargins + 35})`)
      .style('text-anchor', 'middle')
      .text(this.d3Config.axis.x.title);

    this.svgElement.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35)
      .attr('x', 0 - (this.heightWithinMargins / 2))
      .style('text-anchor', 'middle')
      .text(this.d3Config.axis.y.title);
  }
}
