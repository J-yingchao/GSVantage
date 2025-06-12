import * as Plot from "npm:@observablehq/plot";
import * as L from "npm:leaflet";
import proj4 from "https://cdn.skypack.dev/proj4@2.8.0"

let map; // cache map object
let geojsonLayer; // cache geojson layer

export function leafletMap({
  containerId,
  chicagoGeo,
  thresholds,
  width,
  height,
  zoom = 10.5,
}) {
  // console.log("filter thresholds:", thresholds);

  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Element with id "${containerId}" not found`);
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;

  // Initialize map only once
  if (!map) {
    map = L.map(containerId, {
      zoomControl: true,
      minZoom: 10,
      maxZoom: 16,
      maxBounds: [
        [41.6, -88.0],
        [42.1, -87.5]
      ]
    }).setView([41.8781, -87.6298], zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(map);

    // Add info control (only once)
    const info = L.control();
    info.onAdd = function () {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    info.update = function (props) {
      this._div.innerHTML = '<h4>Chicago Census Tract</h4>' + (props ?
        `<b>${props.NAMELSAD}</b><br/>
         Avg_Staleness: ${props.avg_staleness}<br/>
         Dominant Season: ${props.dominant_season || 'N/A'}<br/>
         Dominant Road Type: ${props.dominant_road_type || 'N/A'}` :
        'Hover over a tract');
    };
    info.addTo(map);

    // Attach to global for access in highlight/reset
    map._infoControl = info;
  }

  // Convert to WGS84
  const fromGeo = "EPSG:3857"
  const chicagoWGS84 = convertToWGS84GeoJSON(chicagoGeo, fromGeo);

  // Remove existing layer before adding a new one
  if (geojsonLayer) {
    map.removeLayer(geojsonLayer);
  }

  // Color scale
  const acresArray = chicagoWGS84.features.map(d => d.properties?.avg_staleness || 0);
  const minAcres = Math.min(...acresArray);
  const maxAcres = Math.max(...acresArray);

  function getColorByAcres(acres, min, max) {
    const ratio = 1 - (acres - min) / (max - min);
    let r, g, b = 0;
    if (ratio <= 0.5) {
      // red to yellow
      r = 255;
      g = Math.round(510 * ratio); // 0~255
    } else {
      // yellow to green
      r = Math.round(255 - 510 * (ratio - 0.5));
      g = 255;
    }
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}00`;
  }

  function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });
    layer.bringToFront();
    map._infoControl.update(layer.feature.properties);
  }

  function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
    map._infoControl.update();
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight
    });
  }

  // Add filtered GeoJSON layer
  geojsonLayer = L.geoJSON(chicagoWGS84, {
    style: feature => ({
      color: '#808080',
      weight: 1,
      opacity: 0.8,
      dashArray: '2',
      fillOpacity: 0.6,
      fillColor: getColorByAcres(feature.properties.avg_staleness, minAcres, maxAcres)
    }),
    // filter: feature =>
    //   feature.properties.LAND_ACRES >= thresholds.land &&
    //   feature.properties.WATER_ACRES >= thresholds.water,
    filter: feature =>
    (feature.properties.avg_staleness != null) &&
    feature.properties.pop_density >= thresholds.pop &&
    (feature.properties.median_income >= thresholds.income || feature.properties.median_income < 0)&&
    feature.properties.walk_share >= thresholds.walk &&
    feature.properties.nonwhite_ratio >= thresholds.nonwhite &&
    (feature.properties.median_home_value >= thresholds.home || feature.properties.median_home_value < 0)&&
    feature.properties.single_family_units >= thresholds.single,
    onEachFeature
  }).addTo(map);
}


function convertToWGS84GeoJSON(geojson, fromProj) {
  const toProj = proj4.WGS84;
  return {
    ...geojson,
    features: geojson.features.map(f => {
      const convertCoords = coords => coords.map(pt => proj4(fromProj, toProj, pt));

      let newCoords;
      if (f.geometry.type === "Polygon") {
        newCoords = f.geometry.coordinates.map(convertCoords);
      } else if (f.geometry.type === "MultiPolygon") {
        newCoords = f.geometry.coordinates.map(polygon => polygon.map(convertCoords));
      }

      return {
        ...f,
        geometry: {
          ...f.geometry,
          coordinates: newCoords
        }
      };
    })
  };
}


// Colors and scale
const color = Plot.scale({
  color: {
    type: "linear",
    domain: [2010, 2025],
    range: ["#ff0000", "#ffff00", "#00cc00"] // Older dates are red, newer dates are green
  }
});


// Map legend
export function gsvPointsLegend(width) {
  return Plot.plot({
    marginTop: 25,
    marginRight: 80,
    width,
    height: 60,
    x: {
      tickFormat: d => d.toFixed(0), 
      domain: [2007, 2025]
    },
    y: {axis: null, domain: [0, 3]},
    marks: [
      Plot.raster({
        y1: 0,
        y2: 3,
        x1: 2007,
        x2: 2025,
        fill: (x) => color.apply(x)
      }),
    ]
  });
}
