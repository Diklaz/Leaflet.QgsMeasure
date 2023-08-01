Leaflet.QgsMeasure
======================

Leaflet control to mesure distances on the map like Qgis Ruler.

Requires [Leaflet.Draw](https://github.com/leaflet/Leaflet.Draw#readme)

Check out the [demo](https://gabriel-russo.github.io/Leaflet.QgsMeasure/example/)

Install
-------

```shell
npm install leaflet-qgsmeasure
```

Usage
-----

As map option:

```js
const map = L.map('map', { measureControl: true });
```

Or like any control:

```js
L.Control.qgsmeasure()
  .addTo(map);
```

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
