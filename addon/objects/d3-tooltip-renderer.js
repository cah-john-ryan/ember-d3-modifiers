import * as d3 from 'd3';
import { action } from '@ember/object';
import { D3TimeSeriesConfig } from 'ember-d3-modifiers/objects/d3-config';

export default class D3TooltipRenderer {
  initialize({
    svgElement,
    chartData,
    d3Config,
    allXvalues,
    getValueOnXaxis
  }) {
    this.d3SvgElement = svgElement;
    this.chartData = chartData;
    this.d3Config = d3Config;
    this.allXvalues = allXvalues;
    this.getValueOnXaxis = getValueOnXaxis;
    return this;
  }

  /** @member {object} A full overlay of the chart to detect mouse movement for tooltip rendering */
  tooltipBoxOverlay;

  /** @member {object} A vertical line indicator to show the date currently selected by the location of the mouse */
  tooltipVerticalLine;

  /** @member {object} A div tag for the tooltip that is updated based on mouse movement within tooltipBoxOverlay */
  tooltipElement;

  renderTooltipElementsWithMouseEvents(targetElement) {
    this.tooltipElement = d3.select(targetElement)
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('display', 'none');
    this.tooltipVerticalLine = this.d3SvgElement.append('line');
    this.tooltipBoxOverlay = this.d3SvgElement.append('rect')
      .attr('width', this.d3Config.layout.widthWithinMargins + 10)
      .attr('height', this.d3Config.layout.heightWithinMargins)
      .attr('opacity', 0)
      .attr('class', 'd3-tooltip-box-overlay')
      .on('mousemove', this.handleMouseMove)
      .on('mouseout', this.handleMouseOut);
  }

  @action
  handleMouseMove() {
    const mouseLocationInPixels = d3.mouse(this.tooltipBoxOverlay.node());
    const pixelMouseLocationFromLeft = mouseLocationInPixels[0];
    const pixelMouseLocationFromTop = mouseLocationInPixels[1];
    const mouseLocationOnXaxis = this.getValueOnXaxis.invert(pixelMouseLocationFromLeft);
    let selectedValueOnXaxis = this.allXvalues[0];
    for (let i = 0; i < this.allXvalues.length; i++) {
      if (this.allXvalues[i] > mouseLocationOnXaxis) {
        break;
      }
      selectedValueOnXaxis = this.allXvalues[i];
    }

    if (this.d3Config.tooltip.enableVerticalLine) {
      const selectedXaxisValue = this.getValueOnXaxis(selectedValueOnXaxis);
      this.tooltipVerticalLine.attr('stroke', 'black')
        .attr('x1', selectedXaxisValue)
        .attr('x2', selectedXaxisValue)
        .attr('y1', 0)
        .attr('y2', this.d3Config.layout.heightWithinMargins);
    }

    const dataForWhatIsSelected = this.getDataForWhatIsSelected(selectedValueOnXaxis);

    const toolTipHeaderText = this.d3Config.tooltip.titlePresentationFormatFunction(selectedValueOnXaxis);

    this.tooltipElement.html('')
      .attr('class', 'd3-tooltip')
      .style('display', 'block')
      .style('left', d3.event.pageX + this.d3Config.tooltip.xAxisOffsetFromMouseLocation + 'px')
      .style('top', pixelMouseLocationFromTop + this.d3Config.layout.margin.top + this.d3Config.tooltip.yAxisOffsetFromMouseLocation + 'px');

    this.tooltipElement.append('div')
      .attr('class', 'd3-tooltip-header')
      .html(toolTipHeaderText);

    this.tooltipElement.selectAll()
      .data(dataForWhatIsSelected)
      .enter()
      .append('div')
      .html(this.d3Config.tooltip.presentationFormatFunction);
  }

  getDataForWhatIsSelected(selectedValueOnXaxis) {
    if (this.d3Config instanceof D3TimeSeriesConfig) {
      return this.chartData
        .filter(d => selectedValueOnXaxis.getTime() === d.date.getTime())
        .sort(d => d.seriesId);
    }
    return this.chartData
      .filter(d => selectedValueOnXaxis === d.xValue)
      .sort(d => d.seriesId);
  }

  @action
  handleMouseOut() {
    if (this.tooltipElement) this.tooltipElement.style('display', 'none').html('');
    if (this.tooltipVerticalLine) this.tooltipVerticalLine.attr('stroke', 'none');
  }
}