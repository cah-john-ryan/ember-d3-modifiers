import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('generic', function() {});

  this.route('generic-series', function() {
    this.route('line-chart-demo');
  });
  this.route('time-series', function() {
    this.route('line-chart-demo');
    this.route('scatter-plot-demo');
    this.route('bar-chart-demo');
    this.route('area-chart-demo');
    this.route('line-with-circles-chart-demo');
    this.route('threshold-lines-demo');
    this.route('mixed-chart-types-demo');
    this.route('custom-layout-demo');
    this.route('changing-threshold-lines-demo');
  });
  this.route('pie-chart', function() {
    this.route('pie-chart-demo');
  });
  this.route('categorical-series', function() {
    this.route('line-chart-demo');
  });
});
