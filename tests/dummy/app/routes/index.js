import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  beforeModel(/* transition */) {
    this.transitionTo('time-series.line-chart-demo'); // Implicitly aborts the on-going transition.
  }
}
