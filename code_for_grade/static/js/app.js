// Function to build metadata
function buildMetadata(sample) {
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {
    // Get the metadata field from the data
    const metadata = data.metadata;
    
    // Filter the metadata for the object with the desired sample number
    const result = metadata.find(sampleObj => sampleObj.id === parseInt(sample));
    
    // Use d3 to select the panel with id of `#sample-metadata`
    const panel = d3.select("#sample-metadata");
    
    // Use `.html("")` to clear any existing metadata
    panel.html("");
    
    // Append new tags for each key-value in the filtered metadata
    if (result) {
      const keys = ['id', 'ethnicity', 'gender', 'age', 'location', 'bbtype', 'wfreq'];
      keys.forEach(key => {
        if (result[key] !== undefined) {
          panel.append("h6").text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${result[key]}`);
        }
      });
    }
  });
}

// Function to build the bar chart and bubble chart
function buildCharts(sample) {
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {
    const samples = data.samples;
    const sampleData = samples.find(d => d.id === sample);

    const otu_ids = sampleData.otu_ids;
    const otu_labels = sampleData.otu_labels;
    const sample_values = sampleData.sample_values;

    // Bar Chart
    const barData = otu_ids
      .map((id, i) => ({ id, value: sample_values[i], label: otu_labels[i] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10

    const barSvg = d3.select("#bar").html("").append("svg")
      .attr("width", 960)
      .attr("height", 500)
      .append("g")
      .attr("transform", "translate(50, 50)");

    const xBar = d3.scaleLinear().domain([0, d3.max(barData, d => d.value)]).range([0, 900]);
    const yBar = d3.scaleBand().domain(barData.map(d => d.id)).range([0, 400]).padding(0.1);

    barSvg.selectAll(".bar")
      .data(barData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => yBar(d.id))
      .attr("width", d => xBar(d.value))
      .attr("height", yBar.bandwidth())
      .style("fill", "steelblue") // Change bar color to blue
      .append("title")
      .text(d => d.label);

    // Add chart title
    barSvg.append("text")
      .attr("x", (960 - 100) / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Top 10 Bacteria Cultures Found");

    // Add x-axis
    barSvg.append("g")
      .attr("transform", "translate(0, 400)")
      .call(d3.axisBottom(xBar))
      .append("text")
      .attr("x", 900)
      .attr("y", 30)
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .text("Number of Bacteria"); // x-axis label

    // Add y-axis
    barSvg.append("g")
      .call(d3.axisLeft(yBar));

    // Bubble Chart
    const bubbleData = otu_ids.map((id, i) => ({
      id,
      value: sample_values[i],
      label: otu_labels[i]
    }));

    // Set up dimensions and margins for the bubble chart
    const margin = {top: 30, right: 30, bottom: 70, left: 80};
    const width = 1000 - margin.left - margin.right; // Increased width
    const height = 600 - margin.top - margin.bottom; // Increased height

    // Create the SVG container for the bubble chart
    const bubbleSvg = d3.select("#bubble").html("").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales for the bubble chart
    const xBubble = d3.scaleLinear()
      .domain([0, d3.max(otu_ids) * 1.1]) // Increased range
      .range([0, width]);

    const yBubble = d3.scaleLinear()
      .domain([0, d3.max(sample_values) * 1.1]) // Increased range
      .range([height, 0]);

    const sizeBubble = d3.scaleLinear()
      .domain([0, d3.max(sample_values)])
      .range([10, 60]); // Adjusted size range

    const colorBubble = d3.scaleOrdinal(d3.schemeCategory10);

    // Remove old bubbles
    bubbleSvg.selectAll("*").remove();

    // Add bubbles
    bubbleSvg.selectAll(".bubble")
      .data(bubbleData)
      .enter().append("circle")
      .attr("class", "bubble")
      .attr("cx", d => xBubble(d.id))
      .attr("cy", d => yBubble(d.value))
      .attr("r", d => sizeBubble(d.value))
      .style("fill", d => colorBubble(d.id))
      .style("opacity", 0.6)
      .append("title")
      .text(d => d.label);

    // Add x-axis
    bubbleSvg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xBubble))
      .append("text")
      .attr("x", width)
      .attr("y", 50)
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .text("OTU ID"); // x-axis label

    // Add y-axis
    bubbleSvg.append("g")
      .call(d3.axisLeft(yBubble))
      .append("text")
      .attr("x", -50)
      .attr("y", -20)
      .attr("text-anchor", "end")
      .attr("font-size", "12px")
      .text("Number of Bacteria"); // y-axis label

    // Add chart title
    bubbleSvg.append("text")
      .attr("x", (width / 2))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Bacteria Cultures per Sample");
  });
}

// Function to run on page load
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

// Function for event listener
function optionChanged(newSample) {
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
