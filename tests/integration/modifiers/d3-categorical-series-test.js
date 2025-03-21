import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {CircleAndToolTipConfig, D3CategoricalSeriesConfig, LineConfig} from 'ember-d3-modifiers';
import { create, isPresent } from 'ember-cli-page-object';

const page = create({
  svgLineIsPresent: isPresent('svg path.line')
});

module('Integration | Modifier | d3-categorical-series', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a simple line', async function (assert) {
    this.chartData = [
      { seriesId: 'Series A', label: '2025-01-01', value: 5 },
      { seriesId: 'Series A', label: '2025-01-07', value: 3 },
      { seriesId: 'Series A', label: '2025-01-14', value: 8 },
      { seriesId: 'Series A', label: '2025-01-17', value: 10 }
    ];

    this.d3Config = new D3CategoricalSeriesConfig({
      dataConfig: {
        'Series A': {
          className: 'series-a-custom-styling',
          chartTypes: [
            new LineConfig({lineWidth: 3}),
            new CircleAndToolTipConfig({radius: 4, lineWidth: 2})
          ],
        },
        showLegend: true
      },
      axis: {
        x: {
          title: "Time",
          fontSize: "10px",
          tickSize: "7px",
        },
        y: {
          title: "Orders",
          fontSize: "10px",
          tickCount: 5,
          ticketSize: "10px",
        },
      },
    })

    await render(hbs`<div {{d3-categorical-series
      chartData=this.chartData
      d3Config=this.d3Config}}></div>`);

    assert.ok(page.svgLineIsPresent);
  });
});
