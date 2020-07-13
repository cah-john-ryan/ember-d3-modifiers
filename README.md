# ember-d3-modifiers

This is an Ember modifier that lets you render a D3 document/graph/chart for some common chart types.

(This modifier currently leverages D3 v5 under the hood)

## Compatibility

- Ember.js v3.12 or above
- Ember CLI v2.13 or above
- Node.js v10 or above

## Installation

```
ember install ember-d3-modifiers
```

## Demos

There are several demos available in this repository you can use for reference in addition to the documentation found here.

To view these demos:

1. Clone a local instance of this repository to your local machine.
2. Change directory to where that local cloned instance resides
3. `npm install` to download all needed dependencies
4. `ember s`
5. Open http://localhost:4200 in your browser

## Usage (time series)

An example implementation for this modifier:

```hbs
<div {{d3-time-series
  chartData=this.chartData
  d3Config=this.d3Config}}>
</div>
```

#### chartData parameter

_This is a required parameter_. It should contain an array of objects that contain the below 3 parameters

1. seriesId (An identifier for the source of this data)
2. date
3. value

```json
[
  { "seriesId": "Sensor A", "date": "2020-07-13T17:00:00.000Z", "value": 3 },
  { "seriesId": "Sensor B", "date": "2020-07-13T17:00:00.000Z", "value": 3 },
  { "seriesId": "Sensor A", "date": "2020-07-13T17:01:00.000Z", "value": 4 },
  { "seriesId": "Sensor B", "date": "2020-07-13T17:01:00.000Z", "value": 2 }
]
```

#### d3Config parameter

This is an optional parameter to inform the modifier on how the resulting D3 chart should be rendered. Below is the basic layout of the configuration if you were provide one of your own.

If you are wanting the D3 chart to render with different configuration values you only need to provide an object with only those specific overriding values. _The properties you omit will use the defaults_.

```javascript
var d3Config = {
  layout: {}, // The size of the D3 chart along with margin settings
  dataConfig: {}, // A hash for each seriesId and it's configuration
  genericDataConfig: {}, // A generic configuration for the data being presented (fallback for dataConfig)
  thresholds: [], // An array of thresholds that need to be presented
  axis: {
    x: {}, // x Axis configuration settings
    y: {}, // y Axis configuration settings
  },
  legend: {}, // Settings for if and where the legend should be rendered
  tooltip: {}, // Settings for the tooltip features this modifier provides
};
```

More details on the lower level properties of d3Config can be found at the location below:
https://github.com/cah-johnryan/ember-d3-modifiers/blob/master/addon/objects/d3-config-constants.js

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
