import { nice, tickFormat, ticks } from "d3";
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

// Define global maximums for x-axis
const GLOBAL_X_DOMAIN = [0, 8];

export function filterDensityChart(width, seattleGeo, thresholds, xName) {
  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const axisLabelColor = isDark ? "#FFFFFF" : "#000000";
  if (!seattleGeo || !seattleGeo.features || seattleGeo.features.length === 0) {
    return Plot.plot({
      width,
      height: width * 0.2,
      marks: [
        Plot.text(["No data available"], {
          x: width / 2,
          y: 100,
          fill: axisLabelColor, // Set text color to deep blue
          fontSize: 16,
          textAnchor: "middle"
        })
      ]
    });
  }

  // Filter and process data
  const filteredFeatures = seattleGeo.features.filter(feature =>
    (feature.properties.avg_staleness != null) &&
    feature.properties.pop_density >= thresholds.pop &&
    feature.properties.median_income >= thresholds.income &&
    feature.properties.walk_share >= thresholds.walk &&
    feature.properties.nonwhite_ratio >= thresholds.nonwhite &&
    feature.properties.median_home_value >= thresholds.home &&
    feature.properties.single_family_units >= thresholds.single
  );

  const values = filteredFeatures
    .map(d => +d.properties[xName])
    .filter(d => !isNaN(d));

  if (values.length === 0) {
    return Plot.plot({
      width,
      height: width * 0.2,
      x:{ticks:[]},
      y:{ticks:[]},
      marks: [
        Plot.text(["No valid data after filtering"], {
          fill: axisLabelColor, // Set text color to deep blue
          fontSize: 16,
          textAnchor: "middle"
        })
      ]
    });
  }

  // Calculate statistics
  const meanValue = d3.mean(values).toFixed(2);
  const medianValue = d3.median(values).toFixed(2);

  // Create histogram data and normalize to density
  const histogram = d3.histogram().domain(GLOBAL_X_DOMAIN).thresholds(40)(values);
  const totalCount = values.length;
  const densityData = histogram.map(bin => ({
    x: (bin.x0 + bin.x1) / 2,
    y: bin.length / totalCount // Normalize to density
  }));

  // Calculate the maximum density for dynamic y-axis
  const maxDensity = d3.max(densityData, d => d.y);

  return Plot.plot({
    width: width,
    height: width * 0.2,
    x: { label: xName, domain: GLOBAL_X_DOMAIN, nice: false },
    y: { label: "Density", domain: [0, maxDensity], grid: true },
    marks: [
      Plot.areaY(densityData, {
        x: "x",
        y: "y",
        fill: "#ffa500",
        stroke: "white",
        strokeWidth: 0.5,
        curve: "basis"
      }),
      Plot.ruleY([0]),
      // Add a text box in the top-right corner
      Plot.text(
        [{ x: GLOBAL_X_DOMAIN[1] - 0.5, y: maxDensity, text: `Mean: ${meanValue}\nMedian: ${medianValue}` }],
        {
          x: "x",
          y: "y",
          text: "text",
          textAnchor: "end",
          fill: axisLabelColor, // Set text color to deep blue
          fontSize: 12,
          dx: -10, // Adjust horizontal offset
          dy: -10, // Adjust vertical offset
          lineHeight: 1.2 // Adjust line spacing
        }
      )
    ]
  });
}

export function filterScatterPlot(width, seattleGeo, thresholds, socioVar, socioLabel, stalenessVar = "avg_staleness") {
  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const axisLabelColor = isDark ? "#FFFFFF" : "#000000";
  const filteredFeatures = seattleGeo.features.filter(feature =>
    (feature.properties.avg_staleness != null) &&
    feature.properties.pop_density >= thresholds.pop &&
    feature.properties.median_income >= thresholds.income &&
    feature.properties.walk_share >= thresholds.walk &&
    feature.properties.nonwhite_ratio >= thresholds.nonwhite &&
    feature.properties.median_home_value >= thresholds.home &&
    feature.properties.single_family_units >= thresholds.single
  );

  const data = filteredFeatures
    .map(d => ({
      socio: +d.properties[socioVar],
      staleness: +d.properties[stalenessVar]
    }))
    .filter(d => !isNaN(d.socio) && !isNaN(d.staleness));

  if (data.length === 0) {
    return Plot.plot({
      width,
      height: width * 0.4,
      x: { label: null, ticks:[]},
      y: { label: null, ticks:[]},
      marks: [
        Plot.text(["No valid data after filtering"], {
          fill: axisLabelColor,
          fontSize: 16,
          textAnchor: "middle"
        })
      ]
    });
  }

  // Calculate Pearson correlation coefficient
  const xValues = data.map(d => d.socio);
  const yValues = data.map(d => d.staleness);

  const meanX = d3.mean(xValues);
  const meanY = d3.mean(yValues);

  const stdX = d3.deviation(xValues);
  const stdY = d3.deviation(yValues);

  const r =
    d3.sum(xValues.map((x, i) => (x - meanX) * (yValues[i] - meanY))) /
    ((xValues.length - 1) * stdX * stdY);

  // Helper: error function approximation (Abramowitz and Stegun, formula 7.1.26)
  function erf(x) {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }
  // Helper: standard normal CDF using erf
  function normalCDF(x) {
    return (1.0 + erf(x / Math.sqrt(2))) / 2.0;
  }
  const n = xValues.length;
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  const p = 2 * (1 - normalCDF(Math.abs(t)));

  // Determine significance label
  const pLabel = p < 0.01 ? "p < 0.01" :
                 p < 0.05 ? "p < 0.05" :
                 `p = ${p.toExponential(2)}`;

  return Plot.plot({
    width: width,
    height: width * 0.4,
    x: { label: socioLabel, labelAnchor: "center", tickSize: 0, nice: true},
    y: { label: "Staleness", labelAnchor: "center", tickSize: 0, nice: true},
    marks: [
      Plot.dot(data, {
        x: "socio",
        y: "staleness",
        fill: "#ffa500",
        stroke: "#42d6fd",
        strokeWidth: 0.5,
        opacity: 0.8
      }),
      Plot.linearRegressionY(data, { x: "socio", y: "staleness", stroke: "red", strokeWidth: 2 })
    ],
    caption: `r: ${r.toFixed(3)}, ${pLabel}`,
    style: {
      caption: {
        textAlign: "center",
        fill: "#42d6fd"
      }
    }
  });
}