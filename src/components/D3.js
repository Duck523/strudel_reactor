import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

//change

const D3VolumeChart = ({ data }) => {
    const svgRef = useRef();
    const initialised = useRef(false);

    
    //d3 graph growing from the y axis instead of the usual x axis orginally it was from the x but i thought it would look better from y so I reversed all the values 
    useEffect(() => {
        const svg = d3.select(svgRef.current);

        //width and height are set high because it growing from the y
        const width = 350;
        const height = 350;
        const margin = { top: 20, right: 20, bottom: 40, left: 10 };

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        //domain is between 0 and 1 because that is the way the gain grows its alot smoother this way
        const xScale = d3.scaleLinear()
            .domain([0, 1])
            .nice()
            .range([0, innerWidth]);

        const yScale = d3.scaleBand()
            .domain(data.map(d => d.label))
            .range([0, innerHeight])
            .padding(0.2);

            //if the current graph has been drawn after the values have been updated the graph and text is re drawn making the graph look smooth 
        if (!initialised.current) {
            initialised.current = true;

            svg.selectAll('.bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', margin.left)
                .attr('y', d => yScale(d.label) + margin.top)
                .attr('width', 0)
                .attr('height', yScale.bandwidth())
                .attr('fill', 'steelblue');

                //percentage text
            svg.append("text")
                .attr("class", "percent-text")
                .attr("fill", "white")
                .attr("x", width / 2)
                .attr("y", 60)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
        }

        svg.selectAll('.bar')
            .data(data)
            .transition()
            .attr('width', d => xScale(d.value));

            //the volume val is grabbed then mutiplied by 100 to make a percentage 
        const volumeVal = data[0].value;
        const percent = Math.round(volumeVal * 100);
        svg.select(".percent-text").text(`Volume: ${percent}%`);

    }, [data]);

    return (
        <svg ref={svgRef} width={380} height={250}></svg>
    )
}

export default D3VolumeChart;
