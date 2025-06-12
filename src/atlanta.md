---
theme: dashboard
toc: false
---

# Atlanta

```js
// Import components
import {leafletMap, gsvPointsLegend} from "./components/atlantaMap.js";
import {filterBarChart, filterBarChart2} from "./components/filters.js";
import {filterDensityChart, filterScatterPlot} from "./components/charts.js";
```

```js
//
// Load data snapshots
//
const atlantaGeo = FileAttachment("data/atlanta_blockgroup_enriched.geojson").json();
```


```js
const thresholds = {
  pop: popThresholdChosen, // pop
  income: incomeThresholdChosen, // median_income
  walk: walkThresholdChosen, // walk_share
  nonwhite: nonWhiteThresholdChosen, // nonwhite_ratio
  home: homeValueThresholdChosen, // median_home_value
  single: singleUnitsThresholdChosen // single_family_units
};
```


```js
function centerResize(render) {
  const div = resize(render);
  div.style.display = "flex";
  div.style.flexDirection = "column";
  div.style.alignItems = "center";
  return div;
}
```

```js
// 1
// build the filter dropdown for population density
const category1 = "pop_density";
// // calculate the range of this category
const min1 = d3.min(atlantaGeo.features, d => d.properties[category1]).toFixed(5);
const max1 = d3.max(atlantaGeo.features, d => d.properties[category1]).toFixed(5);
const threshold1 = Inputs.range([min1, max1], {
  value: min1,
  label: "",
  step: 100,
  min: min1,
  max: max1,
  display: "inline" ,
  submit: null
});
// console.log("pop_density, [min, max]", min1, max1);
threshold1.querySelector("input[type='number']").style.display = "none";
const popThresholdChosen  = Generators.input(threshold1);
const xName1 = "Population Density";
```

```js
// 2
// Placeholder for the map median_income
const category2 = "median_income";

// Replace invalid values (e.g., -666666666) with 0 for display purposes
const min2 = d3.min(atlantaGeo.features, d => {
  const v = d.properties[category2];
  return v > 0 ? v : undefined; 
});
const max2 = d3.max(atlantaGeo.features, d => {
  const v = d.properties[category2];
  return v > 0 ? v : undefined; // Replace invalid values with 0
});

// Create the slider for filtering
const threshold2 = Inputs.range([min2, max2], {
  value: min2,
  label: "",
  step: 100,
  min: min2,
  max: max2,
  display: "inline",
  submit: null
});
threshold2.querySelector("input[type='number']").style.display = "none";

// Filtered data for regression analysis (exclude invalid values)
const validIncomeData = atlantaGeo.features.filter(d => d.properties[category2] >= 0);

// Pass valid data for regression analysis
const incomeThresholdChosen = Generators.input(threshold2);
const xName2 = "Median Income";
```

```js
//3
// Placeholder for the map WALK_SHARE
const category3 = "walk_share";
// calculate the range of this category
const min3 = d3.min(atlantaGeo.features, d => d.properties[category3]);
const max3 = d3.max(atlantaGeo.features, d => d.properties[category3]);
const threshold3 = Inputs.range([min3, max3], {
  value: min3,
  label: "",
  step: 0.001,
  min: min3,
  max: max3,
  display: "inline" ,
  submit: null
});
console.log("walk_share, [min, max]", min3, max3);
threshold3.querySelector("input[type='number']").style.display = "none";
const walkThresholdChosen = Generators.input(threshold3);
const xName3 = "Walk Share";
```

```js
//4
// Placeholder for the map nonwhite_ratio
const category4 = "nonwhite_ratio";

// Filter for valid numerical nonwhite_ratio values
const validNonwhiteData = atlantaGeo.features.filter(
  d => d.properties[category4] != null &&
       typeof d.properties[category4] === "number" &&
       !isNaN(d.properties[category4])
);

// Calculate the range of this category using only valid data
const min4 = d3.min(validNonwhiteData, d => d.properties[category4]);
const max4 = d3.max(validNonwhiteData, d => d.properties[category4]);

// Create the slider for filtering
const threshold4 = Inputs.range([min4, max4], {
  value: min4,
  label: "",
  step: 0.005,
  min: min4,
  max: max4,
  display: "inline",
  submit: null
});

// Hide the number input for the slider
threshold4.querySelector("input[type='number']").style.display = "none";

// Generate input for filtering
const nonWhiteThresholdChosen = Generators.input(threshold4);
const xName4 = "Nonwhite Ratio";
```

```js
// Placeholder for the map median_home_value
const category5 = "median_home_value";

// Calculate the range of this category, replacing invalid values (e.g., negative values) with 0 for display purposes
const min5 = d3.min(atlantaGeo.features, d => {
  const v = d.properties[category5];
  return v > 0 ? v : undefined; // Replace invalid values with 0
});
const max5 = d3.max(atlantaGeo.features, d => {
  const v = d.properties[category5];
  return v > 0 ? v : undefined; // Replace invalid values with 0
});

// Create the slider for filtering
const threshold5 = Inputs.range([min5, max5], {
  value: min5,
  label: "",
  step: 100,
  min: min5,
  max: max5,
  display: "inline",
  submit: null
});
// console.log("median_home_value, [min, max]", min5, max5);
threshold5.querySelector("input[type='number']").style.display = "none";

// Filtered data for regression analysis (exclude invalid values)
const validHomeValueData = atlantaGeo.features.filter(d => d.properties[category5] >= 0);

// Pass valid data for regression analysis
const homeValueThresholdChosen = Generators.input(threshold5);
const xName5 = "Median Home Value";
```

```js
//6
// Placeholder for the map single_family_units
const category6 = "single_family_units";
// calculate the range of this category
const min6 = d3.min(atlantaGeo.features, d => d.properties[category6]);
const max6 = d3.max(atlantaGeo.features, d => d.properties[category6]);
const threshold6 = Inputs.range([min6, max6], {
  value: min6,
  label: "",
  step: 10,
  min: min6,
  max: max6,
  display: "inline" ,
  submit: null
});
console.log("single_family_units, [min, max]", min6, max6);
threshold6.querySelector("input[type='number']").style.display = "none";
const singleUnitsThresholdChosen = Generators.input(threshold6);
const xName6 = "Single Family Units";
```


<div class="grid grid-cols-4">
  <div class="card grid-colspan-2 grid-rowspan-4">
    <figure style="max-width: none;">
      <div id = "map">
      ${centerResize((width) => leafletMap({containerId: "map", atlantaGeo, thresholds, width: width, height: width}))}
      </div>
      ${centerResize((width) => gsvPointsLegend(width))}
      <h4 style="text-align: center;">Year</h4>
    </figure>
  </div>

  <!-- Scatter plot 1 -->
  <div class="card">
    <figure style="max-width: none;">
      ${resize((width) => filterScatterPlot(width, atlantaGeo, thresholds, "median_income", "Median Income", "avg_staleness"))}
    </figure>
  </div>

  <!-- Scatter plot 2 -->
  <div class="card">
    <figure style="max-width: none;">
      ${resize((width) => filterScatterPlot(width, atlantaGeo, thresholds, "pop_density", "Population Density", "avg_staleness"))}
    </figure>
  </div>

  <!-- Scatter plot 3 -->
  <div class="card">
    <figure style="max-width: none;">
      ${resize((width) => filterScatterPlot(width, atlantaGeo, thresholds, "single_family_ratio", "Single Family Ratio", "avg_staleness"))}
    </figure>
  </div>

  <!-- Scatter plot 4 -->
  <div class="card">
    <figure style="max-width: none;">
      ${resize((width) => filterScatterPlot(width, atlantaGeo, thresholds, "median_home_value", "Median Home Value", "avg_staleness"))}
    </figure>
  </div>

  <!-- Scatter plot 5 -->
  <div class="card">
    <figure style="max-width: none;">
      ${resize((width) => filterScatterPlot(width, atlantaGeo, thresholds, "walk_share", "Walk Share", "avg_staleness"))}
    </figure>
  </div>

  <!-- Scatter plot 6 -->
  <div class="card">
    <figure style="max-width: none;">
     ${resize((width) => filterScatterPlot(
        width,
        atlantaGeo,
        thresholds,
        "nonwhite_ratio",
        "Nonwhite Ratio",
        "avg_staleness"
    ))}
    </figure>
  </div>
  
  <div class="card grid-colspan-2">
    <figure style="max-width: none;">
      ${resize((width) => filterDensityChart(width, atlantaGeo, thresholds, "avg_staleness", "Staleness (Years)"))}
    </figure>
  </div>

</div>

<div style="grid-column: span 6; text-align:center; margin-top:1em;">
  <button id="reset-filters" style="padding: 6px 12px; cursor: pointer;">
    Reset All Filters
  </button>
</div>
 

## Select your targeted neighbourhood
### Use the filters below to explore how Google Street View image freshness varies by neighborhood characteristics. 
##### Example: I want to see the distribution of image staleness in high-income neighbourhood.


<div class="grid grid-cols-3">
<!-- 1 -->
  <div class="card grid-colspan-1">
    <figure style="max-width: none;">
    ${resize((width) => filterBarChart2(
        width,
        atlantaGeo, 
        popThresholdChosen, 
        category1,
        xName1,
        min1,
        max1
    ))}
    ${threshold1}
    </figure>
  </div>

  <!-- 2 -->
  <div class="card grid-colspan-1">
    <figure style="max-width: none;">
    ${resize((width) => filterBarChart(
        width,
        atlantaGeo, 
        incomeThresholdChosen, 
        category2,
        xName2,
        min2,
        max2
    ))}
    ${threshold2}
    </figure>
  </div>

  <!-- 3 -->
  <div class="card grid-colspan-1">
    <figure style="max-width: none;">
    ${resize((width) => filterBarChart(
        width,
        atlantaGeo, 
        walkThresholdChosen, 
        category3,
        xName3,
        min3,
        max3
    ))}
    ${threshold3}
    </figure>
  </div> 
  
  <!-- 4 -->
<div class="card grid-colspan-1">
  <figure style="max-width: none;">
    ${resize((width) => filterBarChart(
        width,
        atlantaGeo, 
        nonWhiteThresholdChosen, 
        category4,
        xName4,
        min4,
        max4
    ))}
    ${threshold4}
  </figure>

</div>
  <!-- 5 -->
  <div class="card grid-colspan-1">
    <figure style="max-width: none;">
    ${resize((width) => filterBarChart2(
        width,
        atlantaGeo, 
        homeValueThresholdChosen, 
        category5,
        xName5,
        min5,
        max5
    ))}
    ${threshold5}
    </figure>
  </div>

  <!-- 6 -->
  <div class="card grid-colspan-1">
    <figure style="max-width: none;">
    ${resize((width) => filterBarChart(
        width,
        atlantaGeo, 
        singleUnitsThresholdChosen, 
        category6,
        xName6,
        min6,
        max6
    ))}
    ${threshold6}
    </figure>
  </div>
</div>




```js
document.getElementById('reset-filters').onclick = () => {
  threshold1.value = min1;
  threshold2.value = min2;
  threshold3.value = min3;
  threshold4.value = min4;
  threshold5.value = min5;
  threshold6.value = min6;

  threshold1.dispatchEvent(new Event('input'));
  threshold2.dispatchEvent(new Event('input'));
  threshold3.dispatchEvent(new Event('input'));
  threshold4.dispatchEvent(new Event('input'));
  threshold5.dispatchEvent(new Event('input'));
  threshold6.dispatchEvent(new Event('input'));
};
```

<style>
  .notes-container {
    display: flex;
    gap: 1rem;               
    flex-wrap: wrap;     
  }
  .notes-container .small.note {
    flex: 5;                
    min-width: 300px;       
  }
  .info {
    padding: 6px 8px;
    font: 14px/16px Arial, Helvetica, sans-serif;
    background: white;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    border-radius: 5px;
  }
  /* Add grid for 6 scatter plots, 2 columns, 3 rows */
  .scatter-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    grid-template-rows: repeat(1, auto);
    gap: 1em;
    margin-top: 1.5em;
    margin-bottom: 1.5em;
  }
  .scatter-grid .card {
    /* Optionally add card style here if needed */
  }
</style>
