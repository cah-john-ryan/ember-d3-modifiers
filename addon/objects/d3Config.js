const chartTypes = {
  circle: 'circle',
  line: 'line',
  bar: 'bar',
  area: 'area'
};

class LineConfig {
  constructor({ lineWidth, className }) {
    this.chartType = chartTypes.line;
    this.lineWidth = lineWidth;
    this.className = className;
  }
}
class BarConfig extends LineConfig {
  constructor({ barWidth, lineWidth, className }) {
    super({ lineWidth: lineWidth, className: className })
    this.chartType = chartTypes.bar;
    this.barWidth = barWidth;
  }
}
class AreaConfig extends LineConfig {
  constructor({ lineWidth, className }) {
    super({ lineWidth: lineWidth, className: className })
    this.chartType = chartTypes.area;
  }
}
class CircleConfig extends LineConfig {
  constructor({ radius, lineWidth, className }) {
    super({ lineWidth: lineWidth, className: className })
    this.chartType = chartTypes.circle;
    this.radius = radius;
  }
}
export { chartTypes, LineConfig, BarConfig, AreaConfig, CircleConfig };

const defaultGenericDataConfig =
{
  chartTypes: [new LineConfig({ lineWidth: 1, className: null })]
}

export default class D3Config {
  constructor({ genericDataConfig, dataConfig, thresholds } = { genericDataConfig: defaultGenericDataConfig, dataConfig: null, thresholds: [] }) {
    this.genericDataConfig = genericDataConfig ? genericDataConfig : defaultGenericDataConfig;
    this.dataConfig = dataConfig;
    this.thresholds = thresholds;

    if (this.isAreaChartTypePresentInConfig()) {
      this.startYaxisAtZero = true;
    }
  }

  isAreaChartTypePresentInConfig() {
    let result = false;
    if (this.genericDataConfig && this.genericDataConfig.chartTypes.some(c => c.chartType === chartTypes.area)) {
      result = true;
    }
    if (this.dataConfig) {
      Object.keys(this.dataConfig).forEach(dataConfigKey => {
        if (this.dataConfig[dataConfigKey].chartTypes.some(c => c.chartType === chartTypes.area)) {
          result = true;
        }
      });
    }
    return result;
  }

  height = 400;
  width = 900;
  margin = { top: 30, right: 30, bottom: 70, left: 50 };
  axis = {
    x: {
      title: 'Date',
      titleOffsetInPixels: 60,
      tickCount: 16,
      // tickFormat: '%b %e, %I %p' // See: https://github.com/d3/d3-time-format
    },
    y: {
      title: 'Temperature (°C)',
      titleOffsetInPixels: 35,
      tickCount: 10,
    }
  };
  tooltip = {
    enableVerticalLine: true,
    presentationFormatFunction: ({ seriesId, value }) => {
      return `${seriesId}: ${value}`;
    }
  }
}

  // d3Config = {
  //   height: 400,
  //   width: 900,
  //   margin: { top: 30, right: 30, bottom: 50, left: 50 },
  //   axis: {
  //     x: {
  //       title: 'Date',
  //       tickCount: 16
  //     },
  //     y: {
  //       title: 'Temperature (°C)',
  //       tickCount: 10,
  //     }
  //   },
  //   // startYaxisAtZero: true,
  //   defaultDataConfig: {
  //     chartType: 'line',
  //     circleSize: 3,
  //     lineWidth: 2,
  //     barWidth: 10
  //   },
  //   // dataConfig: {
  //   //   'Temperature A': {
  //   //     chartTypes: {
  //   //       type: 'area',
  //   //       size: 2
  //   //     }
  //   //   },
  //   //   'Temperature B': {
  //   //     chartTypes: {
  //   //       type: 'area',
  //   //       size: 2
  //   //     }
  //   //   },
  //   //   'Temperature C': {
  //   //     chartTypes: [{
  //   //       type: 'circle',
  //   //       size: 2
  //   //     },
  //   //     {
  //   //       type: 'line',
  //   //       size: 1
  //   //     }]
  //   //   }
  //   // },
  //   dataConfig: {
  //     'Temperature A': {
  //       chartType: 'line',
  //       circleSize: 5,
  //       lineWidth: 2,
  //       barWidth: 10
  //     }
  //   },
  //   thresholds: [
  //     { thresholdId: 'High Temperature Value', value: 6 },
  //     { thresholdId: 'Low Temperature Value', value: 2 }
  //   ]
  // };