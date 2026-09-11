"use client";

import createPlotlyComponent from "react-plotly.js/factory";
import Plotly from "plotly.js-basic-dist-min";

// Bundled with the basic (no-maps/no-3d) dist to keep the client bundle small.
const Plot = createPlotlyComponent(Plotly);

export default Plot;
