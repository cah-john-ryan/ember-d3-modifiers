import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { D3PieChartConfig} from 'ember-d3-modifiers';
import { create, isPresent } from 'ember-cli-page-object';

const page = create({
  svgIsPresent: isPresent('svg')
});

module('Integration | Modifier | d3-pie-chart', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a simple pie chart', async function (assert) {
    this.chartData = [
      { label: 'Category A', value: 30 },
      { label: 'Category B', value: 20 },
    ];
    this.d3Config = new D3PieChartConfig();

    await render(hbs`<div {{d3-pie-chart
      chartData=this.chartData
      d3Config=this.d3Config}}></div>`);

    assert.ok(page.svgIsPresent);
  });

  test('it renders a simple pie chart 2', async function (assert) {
    this.chartData = [
      { differentLabel: 'Category A', differentValue: 30, differentColor: '#ff0000' },
      { differentLabel: 'Category B', differentValue: 20, differentColor: '#3358ff' },
      { differentLabel: 'Category C', differentValue: 50, differentColor: '#ff5733' },

    ];
    this.d3Config = new D3PieChartConfig({
      accessor: {
        label: d => d["differentLabel"],
        value: d => d["differentValue"],
        color: d => d["differentColor"]
      }
    });

    await render(hbs`<div {{d3-pie-chart
      chartData=this.chartData
      d3Config=this.d3Config}}></div>`);

    assert.ok(page.svgIsPresent);
  });
});
