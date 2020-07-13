import * as d3 from 'd3';

export default class D3AxisRenderer {
  initialize({
    svgElement,
    d3Config,
    getValueOnXaxis,
    getValueOnYaxis
  }) {
    this.d3SvgElement = svgElement;
    this.d3Config = d3Config;
    this.getValueOnXaxis = getValueOnXaxis;
    this.getValueOnYaxis = getValueOnYaxis;
    return this;
  }

  renderXandYaxis() {
    this.d3SvgElement.append('g').call((g) => this.renderXaxis(g, this.getValueOnXaxis));
    this.d3SvgElement.append('g').call((g) => this.renderYaxis(g, this.getValueOnYaxis));
    return this;
  }

  renderXaxis(g) {
    let xAxis;
    if (this.d3Config.axis.x.tickFormat) {
      xAxis = g.attr('transform', `translate(0, ${this.d3Config.layout.heightWithinMargins})`).call(
        d3
          .axisBottom(this.getValueOnXaxis)
          .ticks(this.d3Config.axis.x.tickCount)
          .tickSizeOuter(0)
          .tickFormat(d3.timeFormat(this.d3Config.axis.x.tickFormat))
      );
    } else {
      xAxis = g.attr('transform', `translate(0, ${this.d3Config.layout.heightWithinMargins})`).call(
        d3
          .axisBottom(this.getValueOnXaxis)
          .ticks(this.d3Config.axis.x.tickCount)
          .tickSizeOuter(0)
      );
    }
    xAxis
      .selectAll('text')
      .attr('transform', `translate(${this.d3Config.axis.x.tickOffsetInPixels.x},${this.d3Config.axis.x.tickOffsetInPixels.y}) rotate(${this.d3Config.axis.x.tickRotation})`)
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

  renderAxisLabels() {
    if (this.d3Config.axis.x.title) {
      this.d3SvgElement.append('text')
        .attr('class', 'x-axis-label')
        .attr('transform', `translate(${this.d3Config.layout.widthWithinMargins / 2}, ${this.d3Config.layout.heightWithinMargins + this.d3Config.axis.x.titleOffsetInPixels})`)
        .style('text-anchor', 'middle')
        .text(this.d3Config.axis.x.title);
    }

    if (this.d3Config.axis.y.title) {
      this.d3SvgElement.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', `translate(${this.d3Config.axis.y.titleOffsetInPixels}, ${this.d3Config.layout.heightWithinMargins / 2}) rotate(${this.d3Config.axis.y.titleRotation})`)
        .style('text-anchor', 'middle')
        .text(this.d3Config.axis.y.title);
    }

    return this;
  }
}