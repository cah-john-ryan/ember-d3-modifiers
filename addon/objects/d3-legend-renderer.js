export default class D3LegendRenderer {
  initialize({
    svgElement,
    d3Config,
    getClassesToApply }) {
    this.d3SvgElement = svgElement;
    this.d3Config = d3Config;
    this.getClassesToApply = getClassesToApply;
    return this;
  }

  get legendRenderingFunctions() {
    return {
      'bottom': this.renderLegendAtTheBottom,
      'right': this.renderLegendOnTheRight
    };
  }

  renderLegend(seriesIdListing) {
    if (!this.d3Config.legend.placement || this.d3Config.legend.placement === 'none') {
      return;
    }
    this.legendRenderingFunctions[this.d3Config.legend.placement].call(this,
      seriesIdListing);
  }

  renderLegendOnTheRight(seriesIdListing) {
    const self = this;

    const legend = this.d3SvgElement.append('g')
      .attr('class', 'legend');

    const lg = legend.selectAll('g')
      .data(seriesIdListing)
      .enter()
      .append('g')
      .attr('transform', (seriesId, i) => {
        return `translate(0,${i * 20})`
      });

    lg.append('rect')
      .attr('class', (seriesId, i) => {
        const seriesConfig = self.d3Config.getSeriesConfig(seriesId)
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
      return `translate(${self.d3Config.layout.widthWithinMargins + 25}, ${(self.d3Config.layout.heightWithinMargins - nodeHeight(this)) / 2})`
    });
  }

  renderLegendAtTheBottom(seriesIdListing) {
    // Pulled from https://bl.ocks.org/allyraza/dd42733443f03a372f6b19b4a9a648c0
    const self = this;
    const legend = this.d3SvgElement.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(0,0)');

    const lg = legend.selectAll('g')
      .data(seriesIdListing)
      .enter()
      .append('g');

    lg.append('rect')
      .attr('class', function (seriesId, i) {
        const seriesConfig = self.d3Config.getSeriesConfig(seriesId)
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
      return `translate(${x},${self.d3Config.layout.heightWithinMargins + self.d3Config.legend.yAxisOffsetInPixels})`;
    });

    legend.attr('transform', function () {
      return `translate(${(self.d3Config.layout.widthWithinMargins - nodeWidth(this)) / 2},${0})`
    });
  }
}