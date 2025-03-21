import { chartTypes } from 'ember-d3-modifiers/objects/d3-config-constants';

class LineConfig {
  constructor({ lineWidth }) {
    this.chartType = chartTypes.line;
    this.lineWidth = lineWidth;
  }
}
class BarConfig extends LineConfig {
  constructor({ barWidth, lineWidth }) {
    super({ lineWidth: lineWidth })
    this.chartType = chartTypes.bar;
    this.barWidth = barWidth;
  }
}
class AreaConfig extends LineConfig {
  constructor({ lineWidth }) {
    super({ lineWidth: lineWidth })
    this.chartType = chartTypes.area;
  }
}
class CircleConfig extends LineConfig {
  constructor({ radius, lineWidth }) {
    super({ lineWidth: lineWidth })
    this.chartType = chartTypes.circle;
    this.radius = radius;
  }
}

class CircleAndToolTipConfig extends CircleConfig {
  constructor({ radius, lineWidth, presentationFormatFunction }) {
    super({ lineWidth: lineWidth })
    this.chartType = chartTypes.circleAndTooltip;
    this.radius = radius;
    this.presentationFormatFunction = presentationFormatFunction;
  }
}

export { LineConfig, BarConfig, AreaConfig, CircleConfig, CircleAndToolTipConfig };
