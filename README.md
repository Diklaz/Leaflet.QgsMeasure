Leaflet.QgsMeasure
======================

Leaflet control to mesure distances on the map like Qgis Ruler.

Requires [Leaflet.Draw](https://github.com/leaflet/Leaflet.Draw#readme)

Install
-------

```shell
npm install leaflet-qgsmeasure
```

Demo
-------
Check out the [demo](https://gabriel-russo.github.io/Leaflet.QgsMeasure/example/)

![](docs/images/example_screenshot.png)

Usage
-----

As map option:

```js
const map = L.map('map', { measureControl: true });
```

Or like any control:

```js
const options = {}; // See docs to see options
L.Control.qgsmeasure(options).addTo(map);
```

## Docs

### Options:
```javascript
// Default Options object
options = {
  position: 'topleft',
  shapeOptions: {
    color: "#d07f03",
    stroke: true,
    weight: 4,
    opacity: 0.7,
  },
  icon: new L.DivIcon({
    iconSize: new L.Point(9, 9),
    className: 'leaflet-div-icon leaflet-editing-icon',
  }),
}
```

### Events:

* `qgsmeasure:measurestart` - Event fired when the measure starts
* `qgsmeasure:newsegment` - Event fired when a new segment/vertex is added
  ```javascript
  // Event data example:
  {
    segments: [
      {
        from: 1,
        to: 2,
        distance: 729.5775168261067
      },
      {
        from: 2,
        to: 3,
        distance: 420.2680458268559
      },
    ],
    type: "qgsmeasure:newsegment",
  // target ...,
  // sourceTarget...,
  }
  ```
* `qgsmeasure:measurestop` - Event fired when the measure stops

Development
-----------

```shell
npm install --save-dev     # install dependencies
npm run dev  # Compile and save at dist/ after any change
```

Open index.html in your browser and start editing.

Changelog
---------

See [CHANGELOG.md](./CHANGELOG.md).

Authors
-------
* Gabriel Russo

Forked from (Credits)
-------

* Gilles Bassière
* Alexandra Janin
* Makina Corpus
