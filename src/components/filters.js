import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

export function filterBarChart(width, seattleGeo, threshold, category, xName,  min, max) {
  const height = width * 0.4;
  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // abstract values
  const values = seattleGeo.features
    .map(d => d.properties[category]);

  // build histogram
  const x = d3.scaleLinear()
    .domain([min, max])
    .range([0, innerWidth]);

  const histogram = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(10));  // !!!!adjust the number of bins

  const bins = histogram(values);

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)]).nice()
    .range([innerHeight, 0]);

  // create SVG
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip div
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("padding", "6px 10px")
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("display", "none");

  // build bar cahrt + tooltip
  g.selectAll("rect")
  .data(bins)
  .join("rect")
    .attr("x", d => x(d.x0) + 1)
    .attr("y", d => y(d.length))
    .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
    .attr("height", d => innerHeight - y(d.length))
    .attr("fill", d => d.x0 >= threshold ? "orange" : "#e0e0e0")
    .on("mouseenter", function(event, d) {
      tooltip
        .style("display", "block")
        .html(`Range: ${d.x0} – ${d.x1}<br>Count: ${d.length}`);
      d3.select(this)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseleave", function(event, d) {
      d3.select(this)
        .attr("stroke", null)
        .attr("stroke-width", null);
      tooltip.style("display", "none");
    });

  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const axisLabelColor = isDark ? "#FFFFFF" : "#000000";

  // X-axis
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(7))
    .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", axisLabelColor)
      .attr("text-anchor", "middle")
      .text(`${xName} (threshold: ${threshold})`);

  // Y-axis
  g.append("g")
    .call(d3.axisLeft(y).ticks(6))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -30)
      .attr("fill", axisLabelColor)
      .attr("text-anchor", "middle")
      .text("Count");

  // Threshold line
  if (threshold >= min && threshold <= max) {
    g.append("line")
      .attr("x1", x(threshold))
      .attr("x2", x(threshold))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "red")
      .attr("stroke-width", 2);
  }

  return svg.node();
}


export function filterBarChart2(width, seattleGeo, threshold, category, xName, min, max) {
  const height = width * 0.4;
  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // abstract values
  const values = seattleGeo.features
    .map(d => d.properties[category]);

  // build histogram
  const x = d3.scaleLinear()
    .domain([min, max])
    .range([0, innerWidth]);

  const histogram = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(10));  // !!!!adjust the number of bins

  const bins = histogram(values);

  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)]).nice()
    .range([innerHeight, 0]);

  // create SVG
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip div
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("padding", "6px 10px")
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("display", "none");

  // build bar cahrt + tooltip
  g.selectAll("rect")
  .data(bins)
  .join("rect")
    .attr("x", d => x(d.x0) + 1)
    .attr("y", d => y(d.length))
    .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
    .attr("height", d => innerHeight - y(d.length))
    .attr("fill", d => d.x0 >= threshold ? "orange" : "#e0e0e0")
    .on("mouseenter", function(event, d) {
      tooltip
        .style("display", "block")
        .html(`Range: ${d.x0} – ${d.x1}<br>Count: ${d.length}`);
      d3.select(this)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseleave", function(event, d) {
      d3.select(this)
        .attr("stroke", null)
        .attr("stroke-width", null);
      tooltip.style("display", "none");
    });

  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const axisLabelColor = isDark ? "#FFFFFF" : "#000000";

  // X-axis
  g.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(5))
    .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", axisLabelColor)
      .attr("text-anchor", "middle")
      .text(`${xName} (threshold: ${threshold})`);

  // Y-axis
  g.append("g")
    .call(d3.axisLeft(y).ticks(6))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -30)
      .attr("fill", axisLabelColor)
      .attr("text-anchor", "middle")
      .text("Count");

  // Threshold line
  if (threshold >= min && threshold <= max) {
    g.append("line")
      .attr("x1", x(threshold))
      .attr("x2", x(threshold))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "red")
      .attr("stroke-width", 2);
  }

  return svg.node();
}
