document.addEventListener('DOMContentLoaded', function() {
    // Set up the visualization dimensions
    const margin = { top: 80, right: 180, bottom: 50, left: 80 },
          width = 960 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;
    
    // Create SVG container
    const svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add background color to the SVG
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f9f7f2");
    
    // Create a tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");
    
    // Group by country for color assignment and country positioning
    const countryGroups = d3.group(banksData, d => d.Country);
    
    // Define color scale for countries
    const colorScale = d3.scaleOrdinal()
        .domain(Array.from(countryGroups.keys()))
        .range([
            "#4682b4", // France - blue
            "#4daf4a", // Germany - green
            "#d73027", // Italy - red
            "#fc8d59", // Spain - orange
            "#66c2a5", // Netherlands - teal
            "#984ea3", // UK - purple
            "#ffff33", // Belgium - yellow
            "#a6cee3", // Switzerland - light blue
            "#b2df8a", // Sweden - light green
            "#fdbf6f"  // Denmark - light orange
        ]);
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([30, 130])  // Public Debt (% of GDP) range with padding
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 60])  // Sovereign Exposure range with padding
        .range([height, 0]);
    
    // Bank size scale (radius)
    const sizeScale = d3.scaleSqrt()
        .domain([0, 100])  // Bank Foundations range
        .range([5, 30]);
    
    // Add X axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(8))
        .append("text")
        .attr("x", width)
        .attr("y", 35)
        .attr("text-anchor", "end")
        .attr("fill", "#000")
        .text("Public debt/GDP (%)");
    
    // Add Y axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale).ticks(8))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -height/2)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .text("Sovereign Exposure (in billions)");
    
    // Calculate average position for each country
    const countryPositions = {};
    
    for (const [country, banks] of countryGroups) {
        const avgX = d3.mean(banks, d => d["Public Debt (% of GDP)"]);
        const avgY = d3.mean(banks, d => d["Sovereign Exposure (in billions)"]);
        
        countryPositions[country] = {
            x: xScale(avgX),
            y: yScale(avgY)
        };
    }
    
    // Add connection lines from banks to countries
    svg.selectAll(".connection-line")
        .data(banksData)
        .enter()
        .append("line")
        .attr("class", "connection-line")
        .attr("x1", d => xScale(d["Public Debt (% of GDP)"]))
        .attr("y1", d => yScale(d["Sovereign Exposure (in billions)"]))
        .attr("x2", d => countryPositions[d.Country].x)
        .attr("y2", d => countryPositions[d.Country].y)
        .attr("stroke", d => colorScale(d.Country))
        .attr("stroke-width", 1)
        .attr("opacity", 0.5)
        .style("stroke-dasharray", "3,3");
    
    // Add country labels
    svg.selectAll(".country-label")
        .data(Object.entries(countryPositions))
        .enter()
        .append("text")
        .attr("class", "country-label")
        .attr("x", d => d[1].x)
        .attr("y", d => d[1].y - 15)
        .text(d => d[0])
        .attr("text-anchor", "middle")
        .attr("fill", d => colorScale(d[0]))
        .attr("font-size", "12px")
        .attr("font-weight", "bold");
    
    // Add bank circles
    svg.selectAll(".bank-circle")
        .data(banksData)
        .enter()
        .append("circle")
        .attr("class", "bank-circle")
        .attr("cx", d => xScale(d["Public Debt (% of GDP)"]))
        .attr("cy", d => yScale(d["Sovereign Exposure (in billions)"]))
        .attr("r", d => sizeScale(d["Bank Foundations (in billions)"]))
        .attr("fill", d => colorScale(d.Country))
        .attr("fill-opacity", 0.7)
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("stroke-width", 2)
                .attr("stroke", "#000");
            
            tooltip.style("opacity", 1)
                .html(`
                    <strong>${d["Bank Name"]}</strong><br/>
                    Country: ${d.Country}<br/>
                    Public Debt: ${d["Public Debt (% of GDP)"]}% of GDP<br/>
                    Sovereign Exposure: €${d["Sovereign Exposure (in billions)"]} billion<br/>
                    Bank Foundations: €${d["Bank Foundations (in billions)"]} billion
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("stroke-width", 1)
                .attr("stroke", "#333");
            
            tooltip.style("opacity", 0);
        });
    
    // Add bank name labels for larger banks
    svg.selectAll(".bank-label")
        .data(banksData.filter(d => d["Bank Foundations (in billions)"] > 60)) // Only label larger banks
        .enter()
        .append("text")
        .attr("class", "bank-label")
        .attr("x", d => xScale(d["Public Debt (% of GDP)"]))
        .attr("y", d => yScale(d["Sovereign Exposure (in billions)"]) - sizeScale(d["Bank Foundations (in billions)"]) - 5)
        .text(d => d["Bank Name"])
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#333");
    
    // Add a title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("European Banks and Government Debt");
    
    // Add banks legend on the right side
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 10}, 0)`);
    
    legend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("Banks");
    
    const legendItems = legend.selectAll(".legend-item")
        .data(banksData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20 + 20})`);
    
    legendItems.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d => colorScale(d.Country));
    
    legendItems.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("font-size", "10px")
        .text(d => d["Bank Name"]);
    
    // Add grid lines for better readability
    function makeGridLines(scale, ticks) {
        return d3.axisBottom(scale)
            .ticks(ticks)
            .tickSize(-height)
            .tickFormat("");
    }
    
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(makeGridLines(xScale, 8))
        .attr("stroke-opacity", 0.1);
});
