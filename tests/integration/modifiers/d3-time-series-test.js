import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { D3Config } from 'ember-d3-modifiers';
import { create, isPresent } from 'ember-cli-page-object';

const page = create({
  svgLineIsPresent: isPresent('svg path.line')
});

module('Integration | Modifier | d3-time-series', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a simple line', async function (assert) {
    this.chartData = [
      { seriesId: 'fakeSeriesId', date: moment().add(-1, 'hour').toDate(), value: 1 },
      { seriesId: 'fakeSeriesId', date: moment().toDate(), value: 2 }
    ];
    this.d3Config = new D3Config();

    await render(hbs`<div {{d3-time-series 
      chartData=this.chartData
      d3Config=this.d3Config}}></div>`);

    assert.ok(page.svgLineIsPresent);
  });
});
