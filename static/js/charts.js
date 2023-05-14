function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("static/js/samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector.append("option").text(sample).property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
}

// Demographics Panel
function buildMetadata(sample) {
  d3.json("static/js/samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter((sampleObj) => sampleObj.id == sample);
    var result = resultArray[0];

    // Select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });
  });
}

// Create a buildChart function.
function buildCharts(sample) {
  // Load the samples.json file
  d3.json("static/js/samples.json").then((data) => {
    console.log("data", data);

    // Create a variable that holds the samples array.
    var samplesArray = data.samples;

    // Create a variable that filters the samples for the object with the desired sample number.
    var sampleFilter = samplesArray.filter((samp) => samp.id == sample);

    // Create a variable that filters the metadata array for the object with the desired sample number.
    var metaArray = data.metadata;
    var metaFilter = metaArray.filter((meta) => meta.id == sample);

    // Create a variable that holds the first sample in the array.
    var firstSample = sampleFilter[0];

    // Create a variable that holds the first sample in the metadata array.
    var firstMeta = metaFilter[0];

    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuID = firstSample.otu_ids;
    var otuLabel = firstSample.otu_labels;
    var sampleValues = firstSample.sample_values;

    // Create a variable that holds the washing frequency.
    var freqWash = parseFloat(firstMeta.wfreq);

    // Create the yticks for the bar chart using the top 10 otu_ids and map them in descending order
    var y_ticks = otuID
      .map((a) => `OTU ${a}`)
      .slice(0, 10)
      .reverse();

    // Create the trace for the bar chart.
    var barData = [
      {
        x: sampleValues.slice(0, 10).reverse(),
        y: y_ticks,
        type: "bar",
        orientation: "h",
      },
    ];

    // Create the layout for the bar chart.
    var barLayout = {
      title: "Top Ten Bacteria Cultures Found",
      plot_bgcolor: "#1f2630",
      paper_bgcolor: "#1f2630",
      font: {
        color: "#fff",
      },
    };

    // Plot the data with the layout.
    Plotly.newPlot("bar", barData, barLayout);

    // Create the trace for the bubble chart.
    var bubbleData = [
      {
        x: otuID,
        y: sampleValues,
        text: otuLabel,
        mode: "markers",
        marker: {
          size: sampleValues,
          color: otuID,
          colorscale: "Earth",
        },
      },
    ];

    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures per Sample",
      xaxis: { title: "OTU ID" },
      plot_bgcolor: "#1f2630",
      paper_bgcolor: "#1f2630",
      font: {
        color: "#fff",
      },
    };
    // Plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    // Create the trace for the gauge chart.
    var gaugeData = [
      {
        title: { text: "Belly Button Washing Frequency" },
        value: freqWash,
        type: "indicator",
        mode: "gauge+number",
        gauge: {
          axis: { range: [0, 10] },
          steps: [
            { range: [0, 2], color: "red" },
            { range: [2, 4], color: "orange" },
            { range: [4, 6], color: "yellow" },
            { range: [6, 8], color: "lightgreen" },
            { range: [8, 10], color: "green" },
          ],
        },
      },
    ];

    // Create the layout for the gauge chart.
    gaugeLayout = {
      width: 457,
      height: 450,
      margin: { t: 0, b: 0 },
      plot_bgcolor: "#1f2630",
      paper_bgcolor: "#1f2630",
      font: {
        color: "#fff",
      },
    };

    // Plot the data with the layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });
}
