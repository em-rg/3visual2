# European Banks and Government Debt Visualization

This project visualizes the relationship between European banks, their sovereign debt exposure, and the public debt of their respective countries.

## Overview

The visualization shows:
- Banks represented as circles with size corresponding to their foundation size
- Position on x-axis corresponds to the country's public debt as percentage of GDP
- Position on y-axis shows the bank's sovereign exposure
- Banks are connected to their countries with lines
- Color coding represents different countries or regions

## How to Run

1. Open `index.html` in your browser
2. Alternatively, use a local server:
   ```
   npx http-server
   ```
   and navigate to `http://localhost:8080` in your browser

## Data Source

The data used in this visualization represents European banks, their sovereign exposure, public debt of their countries, and bank foundations.

## Implementation

The visualization is built using D3.js, a powerful JavaScript library for data visualization.
