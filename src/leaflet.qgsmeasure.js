import * as L from "leaflet";
import "leaflet-draw/dist/leaflet.draw-src";
import "leaflet-draw/dist/leaflet.draw-src.css";
import "./leaflet.qgsmeasure.css";

L.Polyline.Measure = L.Draw.Polyline.extend({
  addHooks() {
    L.Draw.Polyline.prototype.addHooks.call(this);
    if (this._map) {
      this._markerGroup = new L.LayerGroup();
      this._map.addLayer(this._markerGroup);

      this.options.shapeOptions = {
        color: "#d07f03",
        stroke: true,
        weight: 4,
        opacity: 0.7,
        fill: false,
        clickable: true,
      };

      this.options.icon = new L.DivIcon({
        iconSize: new L.Point(9, 9),
        className: 'leaflet-div-icon leaflet-editing-icon',
      });

      this._segments = [];
      this._markers = [];
      this._map.on('click', this._onClick, this);
      this._startShape();
    }
  },

  removeHooks() {
    L.Draw.Polyline.prototype.removeHooks.call(this);

    this._clearHideErrorTimeout();

    // !\ Still useful when control is disabled before any drawing (refactor needed?)
    this._map
      .off('pointermove', this._onMouseMove, this)
      .off('mousemove', this._onMouseMove, this)
      .off('click', this._onClick, this);

    this._clearGuides();
    this._container.style.cursor = '';

    this._removeShape();
  },

  _startShape() {
    this._drawing = true;

    this._map.fire("qgsmeasure:measurestart");

    this._poly = new L.Polyline([], this.options.shapeOptions);

    // this is added as a placeholder, if leaflet doesn't receive
    // this when the tool is turned off all onclick events are removed
    this._poly._onClick = () => {
    };

    this._container.style.cursor = 'crosshair';

    this._updateTooltip();

    this._map
      .on('pointermove', this._onMouseMove, this)
      .on('mousemove', this._onMouseMove, this);
  },

  _finishShape() {
    this._drawing = false;

    this._cleanUpShape();
    this._clearGuides();

    this._updateTooltip();

    this._map
      .off('pointermove', this._onMouseMove, this)
      .off('mousemove', this._onMouseMove, this);

    this._container.style.cursor = '';
  },

  _removeShape() {
    if (!this._poly) return;
    this._map.removeLayer(this._poly);
    delete this._poly;
    this._markers.splice(0);
    this._markerGroup.clearLayers();
    this._clearSegments();
  },

  _onClick(e) {
    if (this._markers.length > 1 && this._drawing) {
      this._addSegment();
      this._updateSegmentTooltipNumber();
    }

    if (!this._drawing) {
      this._removeShape();
      this._startShape();
    }
  },

  getSegments() {
    return this._segments;
  },

  _updateSegmentTooltipNumber() {
    let i = 1;
    for (const marker of this._markers) {
      marker.bindTooltip(`${i}`, {
        permanent: true,
        offset: L.point(6, 0),
        opacity: 1,
      })
        .openTooltip();

      i += 1;
    }
  },

  _addSegment() {
    let A = this._markers.at(-2)
      .getLatLng();

    let B = this._markers.at(-1)
      .getLatLng();

    const segmentDistance = this._map.distance(A, B);

    this._segments.push({
      from: this._markers.length - 1,
      to: this._markers.length,
      distance: segmentDistance,
    });

    this._map.fire("qgsmeasure:newsegment", { segments: this._segments });
  },

  _clearSegments() {
    this._segments = [];
    this._map.fire("qgsmeasure:measurestop");
  },

  _getTooltipText() {
    let labelText = L.Draw.Polyline.prototype._getTooltipText.call(this);
    if (!this._drawing) {
      labelText.text = '';
    }
    return labelText;
  },
});

L.Control.QgsMeasure = L.Control.extend({

  statics: {
    TITLE: 'Measure distances',
  },
  options: {
    position: 'topleft',
    handler: {},
  },

  toggle() {
    if (this.handler.enabled()) {
      this.handler.disable.call(this.handler);
    } else {
      this.handler.enable.call(this.handler);
    }
  },

  getSegments() {
    return this.handler.getSegments();
  },

  onAdd(map) {
    let link = null;
    let className = 'leaflet-control-draw';

    this._container = L.DomUtil.create('div', 'leaflet-bar');

    this.handler = new L.Polyline.Measure(map, this.options.handler);

    this.handler.on('enabled', () => {
      this.enabled = true;
      L.DomUtil.addClass(this._container, 'enabled');
    }, this);

    this.handler.on('disabled', () => {
      delete this.enabled;
      L.DomUtil.removeClass(this._container, 'enabled');
    }, this);

    link = L.DomUtil.create('a', `${className}-measure`, this._container);
    link.href = '#';
    link.title = L.Control.QgsMeasure.TITLE;

    L.DomEvent
      .addListener(link, 'click', L.DomEvent.stopPropagation)
      .addListener(link, 'click', L.DomEvent.preventDefault)
      .addListener(link, 'click', this.toggle, this);

    return this._container;
  },
});

L.Map.mergeOptions({
  measureControl: false,
});

L.Map.addInitHook(function () {
  if (this.options.measureControl) {
    this.measureControl = L.Control.qgsmeasure()
      .addTo(this);
  }
});

L.Control.qgsmeasure = (options) => new L.Control.QgsMeasure(options);