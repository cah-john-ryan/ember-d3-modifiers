import Modifier from 'ember-modifier';
import { tracked } from '@glimmer/tracking';
import { dasherize } from '@ember/string';
import { action } from '@ember/object';
import * as d3 from 'd3';
import * as moment from 'moment';
import { chartTypes } from 'ember-d3-modifiers/objects/d3Config';

export default class D3TimeSeriesModifier extends Modifier {
  didReceiveArguments() {
    this.loadD3Chart();
  }

  /** @member {Array.} The source data that is to be rendered
   * The data structure should have three properties: seriesId, date, and value
   */
  @tracked chartData = this.args.named.chartData;

  /** @member {object} The configuration settings to drive how the chart data should be rendered */
  get d3Config() {
    return this.args.named.d3Config;
  }

  get heightWithinMargins() {
    return this.d3Config.height - this.d3Config.margin.top - this.d3Config.margin.bottom;
  }
  get widthWithinMargins() {
    return this.d3Config.width - this.d3Config.margin.left - this.d3Config.margin.right;
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

  /** @member {object} A full overlay of the chart to detect mouse movement for tooltip rendering */
  tooltipBoxOverlay;

  /** @member {object} A vertical line indicator to show the date currently selected by the location of the mouse */
  tooltipVerticalLine;

  /** @member {object} A div tag that is the tooltip that is updated based on mouse movement within svg d3 chart */
  tooltipElement;

  /** @member {Array.} All date values in the source data to help with xAxis mapping in the tooltip placement logic */
  @tracked allDateValues = [];

  loadD3Chart() {
    this.svgElement = this.createSvg();

    const { minDate, maxDate, setOfXvalues } = this.assessChartDataProvided();
    const thresholdSeriesData = this.thresholdLines(minDate, maxDate);
    this.allDateValues = Array.from(setOfXvalues).sort((a, b) => a.getTime() > b.getTime());

    this.getValueOnXaxis = this.xScaleGenerator([].concat(this.chartData, ...thresholdSeriesData));
    this.getValueOnYaxis = this.yScaleGenerator([].concat(this.chartData, ...thresholdSeriesData));
    this.renderXandYaxis();
    this.renderAxisLabels();

    this.renderData();

    this.renderThresholdLines(thresholdSeriesData);

    this.renderTooltipElementsWithMouseEvents();
  }

  createSvg() {
    return d3.select(this.element)
      .append('svg')
      .attr('width', this.d3Config.width)
      .attr('height', this.d3Config.height)
      .append('g')
      .attr('transform', `translate(${this.d3Config.margin.left},${this.d3Config.margin.top})`);
  }

  assessChartDataProvided() {
    return this.chartData.reduce((currentValues, temperatureReading) => {
      currentValues.minDate = currentValues.minDate > temperatureReading.date ? temperatureReading.date : currentValues.minDate;
      currentValues.maxDate = currentValues.maxDate < temperatureReading.date ? temperatureReading.date : currentValues.maxDate;
      currentValues.setOfXvalues.add(temperatureReading.date);
      return currentValues;
    }, { minDate: this.chartData[0].date, maxDate: this.chartData[0].date, setOfXvalues: new Set() });
  }

  thresholdLines(minDate, maxDate) {
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
      .domain(this.d3Config.startYaxisAtZero ?
        [0, d3.max(dataSeries, d => d.value)] :
        d3.extent(dataSeries, d => d.value))
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
      .y1((d) => this.getValueOnYaxis(d.value))
      .curve(d3.curveMonotoneX);
  }

  renderXandYaxis() {
    this.svgElement.append('g').call((g) => this.renderXaxis(g, this.getValueOnXaxis));
    this.svgElement.append('g').call((g) => this.renderYaxis(g, this.getValueOnYaxis));
  }

  renderXaxis(g) {
    let xAxis;
    if (this.d3Config.axis.x.tickFormat) {
      xAxis = g.attr('transform', `translate(0, ${this.heightWithinMargins})`).call(
        d3
          .axisBottom(this.getValueOnXaxis)
          .ticks(this.d3Config.axis.x.tickCount)
          .tickSizeOuter(0)
          .tickFormat(d3.timeFormat('%b %e, %I %p'))
      );
    } else {
      xAxis = g.attr('transform', `translate(0, ${this.heightWithinMargins})`).call(
        d3
          .axisBottom(this.getValueOnXaxis)
          .ticks(this.d3Config.axis.x.tickCount)
          .tickSizeOuter(0)
      );
    }
    xAxis
      .selectAll('text')
      .attr('transform', 'translate(-10,10)rotate(-45)')
      .style('text-anchor', 'end');

    return xAxis;
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
    const renderingFunctions = this.getRenderingFunctions();

    this.getSeriesIdListing(this.chartData).forEach(seriesId => {
      const seriesData = this.chartData.filter(d => d.seriesId === seriesId);
      const dataConfigForSeries = this.d3Config.dataConfig && this.d3Config.dataConfig[seriesId] ?
        this.d3Config.dataConfig[seriesId] :
        this.d3Config.genericDataConfig;

      dataConfigForSeries.chartTypes.forEach(chartTypeToRender => {
        const renderingFunctionForChart = renderingFunctions[chartTypeToRender.chartType];
        if (renderingFunctionForChart) {
          renderingFunctionForChart.call(this, seriesId, seriesNumber, seriesData, chartTypeToRender);
        }
      });

      seriesNumber++;
    });
  }

  getSeriesIdListing() {
    const seriesIdSet = this.chartData.reduce((listing, temperatureReading) => listing.add(temperatureReading.seriesId), new Set());
    return Array.from(seriesIdSet);
  }

  getRenderingFunctions() {
    const renderingFunctions = {};
    renderingFunctions[chartTypes.line] = this.renderLineData;
    renderingFunctions[chartTypes.bar] = this.renderBarData;
    renderingFunctions[chartTypes.area] = this.renderAreaData;
    renderingFunctions[chartTypes.circle] = this.renderCircleData;
    return renderingFunctions;
  }

  renderLineData(seriesId, seriesNumber, seriesData, dataConfig) {
    this.svgElement.append('path')
      .datum(seriesData)
      .attr('class', this.getClassesToApply(chartTypes.line, dataConfig, seriesNumber, seriesId))
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', dataConfig.lineWidth)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', this.lineGenerator());
  }

  renderBarData(seriesId, seriesNumber, seriesData, dataConfig) {
    this.svgElement.selectAll('whatever')
      .data(seriesData)
      .enter()
      .append('rect')
      .attr('class', this.getClassesToApply(chartTypes.bar, dataConfig, seriesNumber, seriesId))
      .attr('x', d => this.getValueOnXaxis(d.date))
      .attr('y', d => this.getValueOnYaxis(d.value))
      .attr('stroke', 'black')
      .attr('stroke-width', dataConfig.lineWidth)
      .attr('width', dataConfig.barWidth)
      .attr('height', d => this.heightWithinMargins - this.getValueOnYaxis(d.value));
  }

  renderAreaData(seriesId, seriesNumber, seriesData, dataConfig) {
    this.svgElement.append('path')
      .datum(seriesData)
      .attr('class', this.getClassesToApply(chartTypes.area, dataConfig, seriesNumber, seriesId))
      .attr('stroke', 'black')
      .attr('stroke-width', dataConfig.lineWidth)
      .attr('d', this.areaGenerator());
  }

  renderCircleData(seriesId, seriesNumber, seriesData, dataConfig) {
    this.svgElement.selectAll('whatever')
      .data(seriesData)
      .enter()
      .append('circle')
      .attr('class', this.getClassesToApply(chartTypes.circle, dataConfig, seriesNumber, seriesId))
      .attr('stroke', 'black')
      .attr('stroke-width', dataConfig.lineWidth)
      .attr('cx', d => this.getValueOnXaxis(d.date))
      .attr('cy', d => this.getValueOnYaxis(d.value))
      .attr('r', dataConfig.radius);
  }

  getClassesToApply(seriesType, dataConfig, seriesNumber, seriesId) {
    return dataConfig.className ?
      `${seriesType} series-${seriesNumber} ${dasherize(seriesId)} ${dataConfig.className}` :
      `${seriesType}  series-${seriesNumber} ${dasherize(seriesId)}`;
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

  renderAxisLabels() {
    this.svgElement.append('text')
      .attr('class', 'x-axis-label')
      .attr('transform', `translate(${this.widthWithinMargins / 2}, ${this.heightWithinMargins + this.d3Config.axis.x.titleOffsetInPixels})`)
      .style('text-anchor', 'middle')
      .text(this.d3Config.axis.x.title);

    this.svgElement.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -this.d3Config.axis.y.titleOffsetInPixels)
      .attr('x', 0 - (this.heightWithinMargins / 2))
      .style('text-anchor', 'middle')
      .text(this.d3Config.axis.y.title);
  }

  renderTooltipElementsWithMouseEvents() {
    this.tooltipElement = d3.select(this.element)
      .append('div')
      .attr('class', 'd3-tooltip d3-tooltip-hidden');
    this.tooltipVerticalLine = this.svgElement.append('line');
    this.tooltipBoxOverlay = this.svgElement.append('rect')
      .attr('width', this.widthWithinMargins + 10)
      .attr('height', this.heightWithinMargins)
      .attr('opacity', 0)
      .attr('class', 'd3-tooltip-box-overlay')
      .on('mousemove', this.handleMouseMove)
      .on('mouseout', this.handleMouseOut);
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

    if (this.d3Config.tooltip.enableVerticalLine) {
      const selectedXaxisValue = this.getValueOnXaxis(selectedDateOnXaxis);
      this.tooltipVerticalLine.attr('stroke', 'black')
        .attr('x1', selectedXaxisValue)
        .attr('x2', selectedXaxisValue)
        .attr('y1', 0)
        .attr('y2', this.heightWithinMargins);
    }


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
      .html(this.d3Config.tooltip.presentationFormatFunction);
  }

  @action
  handleMouseOut() {
    if (this.tooltipElement) this.tooltipElement.attr('class', 'd3-tooltip d3-tooltip-hidden').html('');
    if (this.tooltipVerticalLine) this.tooltipVerticalLine.attr('stroke', 'none');
  }
}
