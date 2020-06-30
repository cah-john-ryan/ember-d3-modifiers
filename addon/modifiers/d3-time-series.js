import Modifier from 'ember-modifier';

export default class D3TimeSeriesModifier extends Modifier {
  didReceiveArguments() {
    console.log(`didReceiveArguments running: ${this.element}`)
  }
}
