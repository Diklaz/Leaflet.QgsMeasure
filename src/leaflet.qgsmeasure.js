import * as L from "leaflet";
import "./leaflet.polyline.measure.js";
import "./leaflet.qgsmeasure.css";

L.Control.QgsMeasure = L.Control.extend({

  statics: {
    TITLE: 'Measure distances',
    SEGMENTS_TITLE: 'Segments (meters):',
    SEGMENTS_FROM: "From: ",
    SEGMENTS_TO: "to: ",
    SEGMENTS_TOTAL: 'Total: ',
    SEGMENTS_METERS: "m",
  },
  options: {
    position: 'topleft',
    handler: {},
    shapeOptions: {
      color: "#d07f03",
      stroke: true,
      weight: 4,
      opacity: 0.7,
      fill: false,
      clickable: true,
    },
    icon: new L.DivIcon({
      iconSize: new L.Point(9, 9),
      className: 'leaflet-div-icon leaflet-editing-icon',
    }),
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

  initialize(options) {
    L.Util.setOptions(this, options);
  },

  _createTextElement(tag, className, container, text) {
    L.DomUtil.create(tag, className, container).innerText = text;
  },

  _createSegmentContainer() {
    if (this._segments_container) {
      return;
    }

    /* Getting the leaflet top right container */
    const [topleft] = document.getElementsByClassName("leaflet-top leaflet-right");

    /* Box over the map containing all data */
    this._segments_container = L.DomUtil.create('div', `segments-container leaflet-control`, topleft);

    /* Prevents zoom map when scroll over the container */
    L.DomEvent.disableScrollPropagation(this._segments_container);

    /* Box Title */
    this._createTextElement('span', 'segments-title', this._segments_container, L.Control.QgsMeasure.SEGMENTS_TITLE);

    /* Box containing all the measures */
    this._segments_measures_container = L.DomUtil.create('div', "segments-measures-container", this._segments_container);

    /* Box containing the Sum of distances (it's separate from measures to stay on bottom) */
    this._segments_total_distance_container = L.DomUtil.create('div', "segments-total-distance-container", this._segments_container);

    /* Initialize total distance text */
    this._total_distance_text_reset = `${L.Control.QgsMeasure.SEGMENTS_TOTAL} 0 ${L.Control.QgsMeasure.SEGMENTS_METERS}`;
    this._createTextElement('span', '', this._segments_total_distance_container, this._total_distance_text_reset);
    this._total_distance_text_element = document.getElementsByClassName('segments-total-distance-container')[0].firstChild;
  },

  _startMeasure(e) {
    let { segments } = e;
    const lastSegment = segments.at(-1);

    const from = L.Control.QgsMeasure.SEGMENTS_FROM;
    const to = L.Control.QgsMeasure.SEGMENTS_TO;
    const meters = L.Control.QgsMeasure.SEGMENTS_METERS;

    let totalDistance = segments.reduce((acc, segment) => acc + segment.distance, 0);

    const text = `${from} ${lastSegment.from} ${to} ${lastSegment.to} = ${lastSegment.distance.toFixed(2)} ${meters}`;

    this._createTextElement('span', 'segment-measure', this._segments_measures_container, text);

    this._total_distance_text_element.innerText = `${L.Control.QgsMeasure.SEGMENTS_TOTAL} ${totalDistance.toFixed(3)} ${L.Control.QgsMeasure.SEGMENTS_METERS}`;

    this._segments_container.scrollTop = this._segments_measures_container.scrollHeight;
  },

  _finishMeasure() {
    while (this._segments_measures_container.firstChild) {
      this._segments_measures_container.removeChild(this._segments_measures_container.firstChild);
    }
    this._total_distance_text_element.innerText = this._total_distance_text_reset;
  },

  onAdd(map) {
    let link = null;
    let className = 'leaflet-control-draw';

    this._container = L.DomUtil.create('div', 'leaflet-bar');

    this.handler = new L.Polyline.Measure(map, this.options);

    this._map.on("qgsmeasure:measurestart", this._createSegmentContainer, this);
    this._map.on("qgsmeasure:newsegment", this._startMeasure, this);
    this._map.on("qgsmeasure:measurestop", this._finishMeasure, this);

    /* Leaflet Control */
    this.handler.on('enabled', () => {
      L.DomUtil.addClass(this._segments_container, 'show');
      this.enabled = true;
    }, this);

    this.handler.on('disabled', () => {
      delete this.enabled;
      L.DomUtil.removeClass(this._segments_container, 'show');
      this._finishMeasure();
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
