import Modifier from 'ember-modifier';
import { tracked } from '@glimmer/tracking';
import { dasherize } from '@ember/string';
import { action } from '@ember/object';
import * as d3 from 'd3';
import * as moment from 'moment';
import { chartTypes } from 'ember-d3-modifiers';

export default class D3TimeSeriesModifier extends Modifier {
  didReceiveArguments() {
    this.loadD3Chart();
  }

  /** @member {Array.} The source data that is to be rendered
   * The data structure should have three properties: seriesId, date, and value */
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

  /** @member {object} A div tag for the tooltip that is updated based on mouse movement within tooltipBoxOverlay */
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
    this.renderLegend();

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
    return this.chartData.reduce((currentValues, chartElement) => {
      currentValues.minDate = currentValues.minDate > chartElement.date ? chartElement.date : currentValues.minDate;
      currentValues.maxDate = currentValues.maxDate < chartElement.date ? chartElement.date : currentValues.maxDate;
      currentValues.setOfXvalues.add(chartElement.date);
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
    this.seriesIdListing.forEach(seriesId => {
      const seriesData = this.chartData.filter(d => d.seriesId === seriesId);
      const seriesConfig = this.getDataConfig(seriesId);
      seriesConfig.seriesId = seriesId;
      seriesConfig.seriesNumber = seriesNumber;

      seriesConfig.chartTypes.forEach(chartConfig => {
        const renderingFunctionForChart = this.renderingFunctions[chartConfig.chartType];
        if (renderingFunctionForChart) {
          renderingFunctionForChart.call(this, seriesData, seriesConfig, chartConfig);
        }
      });

      seriesNumber++;
    });
  }

  get seriesIdListing() {
    const seriesIdSet = this.chartData.reduce((listing, temperatureReading) => listing.add(temperatureReading.seriesId), new Set());
    return Array.from(seriesIdSet).sort();
  }

  getDataConfig(seriesId) {
    return this.d3Config.dataConfig && this.d3Config.dataConfig[seriesId] ?
      this.d3Config.dataConfig[seriesId] :
      this.d3Config.genericDataConfig;
  }

  get renderingFunctions() {
    const renderingFunctions = {};
    renderingFunctions[chartTypes.line] = this.renderLineData;
    renderingFunctions[chartTypes.bar] = this.renderBarData;
    renderingFunctions[chartTypes.area] = this.renderAreaData;
    renderingFunctions[chartTypes.circle] = this.renderCircleData;
    return renderingFunctions;
  }

  renderLineData(seriesData, seriesConfig, chartConfig) {
    this.svgElement.append('path')
      .datum(seriesData)
      .attr('class', this.getClassesToApply(seriesConfig, chartConfig))
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', chartConfig.lineWidth)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', this.lineGenerator());
  }

  renderBarData(seriesData, seriesConfig, chartConfig) {
    this.svgElement.selectAll('whatever')
      .data(seriesData)
      .enter()
      .append('rect')
      .attr('class', this.getClassesToApply(seriesConfig, chartConfig))
      .attr('x', d => this.getValueOnXaxis(d.date))
      .attr('y', d => this.getValueOnYaxis(d.value))
      .attr('stroke', 'black')
      .attr('stroke-width', chartConfig.lineWidth)
      .attr('width', chartConfig.barWidth)
      .attr('height', d => this.heightWithinMargins - this.getValueOnYaxis(d.value));
  }

  renderAreaData(seriesData, seriesConfig, chartConfig) {
    this.svgElement.append('path')
      .datum(seriesData)
      .attr('class', this.getClassesToApply(seriesConfig, chartConfig))
      .attr('stroke', 'black')
      .attr('stroke-width', chartConfig.lineWidth)
      .attr('d', this.areaGenerator());
  }

  renderCircleData(seriesData, seriesConfig, chartConfig) {
    this.svgElement.selectAll('whatever')
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

  renderLegend() {
    if (!this.d3Config.legend.visible) {
      return;
    }
    this.legendRenderingFunctions[this.d3Config.legend.placement].call(this);
  }

  get legendRenderingFunctions() {
    return {
      'bottom': this.renderLegendAtTheBottom,
      'right': this.renderLegendOnTheRight
    };
  }

  renderLegendOnTheRight() {
    const self = this;

    const legend = this.svgElement.append('g')
      .attr('class', 'legend');

    const lg = legend.selectAll('g')
      .data(this.seriesIdListing)
      .enter()
      .append('g')
      .attr('transform', (seriesId, i) => {
        return `translate(0,${i * 20})`
      });

    lg.append('rect')
      .attr('class', (seriesId, i) => {
        const seriesConfig = self.getDataConfig(seriesId)
        seriesConfig.seriesId = seriesId;
        seriesConfig.seriesNumber = i + 1;
        let firstChartConfig = seriesConfig.chartTypes[0];
        return self.getClassesToApply(seriesConfig, firstChartConfig);
      })
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', 10)
      .attr('stroke-width', 3);

    lg.append('text')
      .attr('x', 15)
      .attr('y', 10)
      .text(d => d);

    let nodeHeight = (d) => d.getBBox().height;

    legend.attr('transform', function () {
      return `translate(${self.widthWithinMargins + 25}, ${(self.heightWithinMargins - nodeHeight(this)) / 2})`
    });
  }

  renderLegendAtTheBottom() {
    // Pulled from https://bl.ocks.org/allyraza/dd42733443f03a372f6b19b4a9a648c0
    const self = this;
    const legend = this.svgElement.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(0,0)');

    const lg = legend.selectAll('g')
      .data(this.seriesIdListing)
      .enter()
      .append('g');

    lg.append('rect')
      .attr('class', function (seriesId, i) {
        const seriesConfig = self.getDataConfig(seriesId)
        seriesConfig.seriesId = seriesId;
        seriesConfig.seriesNumber = i + 1;
        let firstChartConfig = seriesConfig.chartTypes[0];
        return self.getClassesToApply(seriesConfig, firstChartConfig);
      })
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', 10)
      .attr('stroke-width', 3);

    lg.append('text')
      .attr('x', 15)
      .attr('y', 10)
      .text(d => d);

    let nodeWidth = (d) => d.getBBox().width;
    let offset = 0;
    lg.attr('transform', function () {
      let x = offset;
      offset += nodeWidth(this) + 10;
      return `translate(${x},${self.heightWithinMargins + self.d3Config.legend.yAxisOffsetInPixels})`;
    });

    legend.attr('transform', function () {
      return `translate(${(self.widthWithinMargins - nodeWidth(this)) / 2},${0})`
    });
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
      .style('left', d3.event.pageX + this.d3Config.tooltip.xAxisOffsetFromMouseLocation + 'px')
      .style('top', d3.event.pageY - this.d3Config.margin.top + this.d3Config.tooltip.yAxisOffsetFromMouseLocation + 'px')
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
