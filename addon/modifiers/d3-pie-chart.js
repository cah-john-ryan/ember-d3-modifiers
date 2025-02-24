import Modifier from "ember-modifier";
import * as d3 from "d3";
import { D3PieChartConfig } from "ember-d3-modifiers/objects/d3-config";
import D3PieChartTooltipRenderer from "ember-d3-modifiers/objects/d3-pie-chart-tooltip-renderer";

export default class D3PieChartModifier extends Modifier {
  didReceiveArguments() {
    this.d3PieChartTooltipRenderer = new D3PieChartTooltipRenderer();
    this.loadD3Chart();
  }

  /** @member {object} The svg tag that D3 renders in the markup */
  svgElement;

  /** @member {object} The configuration settings to drive how the chart data should be rendered */
  get d3Config() {
    return !this.args.named.d3Config ? new D3PieChartConfig() : this.args.named.d3Config;
  }

  loadD3Chart() {
    if (!this.svgElement) {
      this.svgElement = this.createSvg();
    }

    const renderedChart = this.renderChart(this.svgElement);

    this.d3PieChartTooltipRenderer.initialize({
      svgElement: renderedChart,
      d3Config: this.d3Config,
    }).renderTooltipElementsWithMouseEvents(this.element);
  }

  createSvg() {
    const width = this.d3Config.layout.width;
    const height = this.d3Config.layout.height;

    d3.select(this.element).style('position', 'relative');

    const svg =  d3.select(this.element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    return svg
  }

  renderChart(svg) {
    const radius = Math.min(this.d3Config.layout.width, this.d3Config.layout.height) / 2;

    const pie = d3.pie().value(this.d3Config.accessor.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const color = d3.scaleOrdinal()
      .domain(this.args.named.chartData)

      .range(d3.schemeCategory10);

    return svg.selectAll('path')
      .data(pie(this.args.named.chartData))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => this.d3Config.accessor.color ? this.d3Config.accessor.color(d.data) : color(this.d3Config.accessor.label(d.data)));
  }
}
