import * as d3 from 'd3';
import { action } from '@ember/object';

export default class D3PieChartTooltipRenderer {
  initialize({
               svgElement,
               d3Config,
             }) {
    this.d3SvgElement = svgElement;
    this.d3Config = d3Config;
    return this;
  }

  /** @member {object} A div tag for the tooltip that is updated based on mouse movement within tooltipBoxOverlay */
  tooltipElement;

  renderTooltipElementsWithMouseEvents(targetElement) {
    this.tooltipElement = d3.select(targetElement)
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('display', 'none')

    this.d3SvgElement
      .on('mousemove', d =>  this.handleMouseMove(d))
      .on('mouseout', this.handleMouseOut);
  }

  @action
  handleMouseMove(data) {
    const toolTipHeaderText = this.d3Config.generateToolTipHeader
      ? this.d3Config.generateToolTipHeader(this.d3Config.accessor.label(data.data))
      : this.d3Config.accessor.label(data.data);

    const toolTipContentText = this.d3Config.generateToolTipContent
      ? this.d3Config.generateToolTipContent(this.d3Config.accessor.value(data.data))
      : this.d3Config.accessor.value(data.data);

    this.tooltipElement.html('')
      .attr('class', 'd3-tooltip')
      .style('display', 'block')
      .style('width', 'max-content')
      .style('left', (d3.event.offsetX + 10) + 'px') // Offset to the right of the mouse
      .style('top', (d3.event.offsetY + 10) + 'px'); // Offset to the bottom of the mouse

    this.tooltipElement.append('div')
      .attr('class', 'd3-tooltip-header')
      .html(toolTipHeaderText)
      .append('div')
      .style('font-weight', 'normal')
      .html(toolTipContentText)
  }

  @action
  handleMouseOut() {
    if (this.tooltipElement) this.tooltipElement.style('display', 'none').html('');
  }
}
