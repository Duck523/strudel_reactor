import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

//change

const D3VolumeChart = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const width = 200;
        const height = 40;
        const margin = { top: 20, right: 20, bottom: 40, left: 40 };

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;


        const xScale = d3.scaleLinear()
            .domain([0, 1])
            .nice()
            .range([0, innerWidth]);

        const yScale = d3.scaleBand()
            .domain(data.map(d => d.label))
            .range([0, innerWidth])
            .padding(0.2);

        svg.selectAll('.bar')
            .data(data)
            .join(
                enter => enter.append('rect')
                    .attr('class', 'bar')
                    .attr('x', margin.left)
                    .attr('y', d => yScale(d.label) + margin.top)
                    .attr('width', 0)
                    .attr('height', yScale.bandwidth())
                    .attr('fill', 'steelblue')
                    .call(enter => enter.transition()
                        //.duration(750)
                        .attr('width', d => xScale(d.value))
                    ),
                update => update.call(update => update.transition()
                    //.duration(750)
                    .attr('width', d => xScale(d.value))
                )
            );

    }, [data]);

    return (
        <svg ref={svgRef} width={260} height={100}></svg>
    )
}

export default D3VolumeChart;
