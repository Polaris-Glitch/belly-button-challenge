// Function to build metadata
function buildMetadata(sample) {
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {
    const metadata = data.metadata;
    const result = metadata.find(sampleObj => sampleObj.id === sample);
    const panel = d3.select("#sample-metadata");
    panel.html("");
    Object.entries(result).forEach(([key, value]) => {
      panel.append("h6").text(`${key}: ${value}`);
    });
  });
}

// Function to build charts
function buildCharts(sample) {
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {
    const samples = data.samples;
    const sampleData = samples.find(d => d.id === sample);
    const otu_ids = sampleData.otu_ids;
    const otu_labels = sampleData.otu_labels;
    const sample_values = sampleData.sample_values;

    // Bubble Chart
    const bubbleData = otu_ids.map((id, i) => ({
      id,
      value: sample_values[i],
      label: otu_labels[i]
    }));
    
    const margin = {top: 20, right: 20, bottom: 30, left: 50};
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    let bubbleSvg = d3.select("#bubble").select("svg");
    if (bubbleSvg.empty()) {
      bubbleSvg = d3.select("#bubble").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    }

    const x = d3.scaleLinear().range([0, width]).domain([d3.min(otu_ids), d3.max(otu_ids)]);
    const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(sample_values)]);
    const size = d3.scaleLinear().range([5, 50]).domain([0, d3.max(sample_values)]);
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    bubbleSvg.selectAll(".bubble").data(bubbleData).enter().append("circle")
      .attr("class", "bubble")
      .attr("cx", d => x(d.id))
      .attr("cy", d => y(d.value))
      .attr("r", d => size(d.value))
      .style("fill", d => color(d.id))
      .style("opacity", 0.6)
      .append("title")
      .text(d => d.label);

    bubbleSvg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    bubbleSvg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y));

    // Bar Chart
    const barData = otu_ids.map((id, i) => ({ id, value: sample_values[i], label: otu_labels[i] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const barMargin = {top: 20, right: 20, bottom: 80, left: 100};
    const barWidth = 960 - barMargin.left - barMargin.right;
    const barHeight = 500 - barMargin.top - barMargin.bottom;

    let barSvg = d3.select("#bar").select("svg");
    if (barSvg.empty()) {
      barSvg = d3.select("#bar").append("svg")
        .attr("width", barWidth + barMargin.left + barMargin.right)
        .attr("height", barHeight + barMargin.top + barMargin.bottom)
        .append("g")
        .attr("transform", `translate(${barMargin.left},${barMargin.top})`);
    }

    const xBar = d3.scaleLinear().range([0, barWidth]);
    const yBar = d3.scaleBand().range([barHeight, 0]).padding(0.1);

    xBar.domain([0, d3.max(barData, d => d.value)]);
    yBar.domain(barData.map(d => d.id));

    barSvg.selectAll(".bar").data(barData).enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => yBar(d.id))
      .attr("width", d => xBar(d.value))
      .attr("height", yBar.bandwidth())
      .style("fill", "steelblue");

    barSvg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${barHeight})`)
      .call(d3.axisBottom(xBar));

    barSvg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yBar));
  });
}

// Function for event listener
function optionChanged(newSample) {
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
function init() {
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {
    const sampleNames = data.names;
    const dropdown = d3.select("#selDataset");

    dropdown.selectAll("option")
      .data(sampleNames)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);

    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

init();


