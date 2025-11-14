import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

//change

const D3VolumeChart = ({ data }) => {
    const svgRef = useRef();
    const initialised = useRef(false);

    

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const width = 350;
        const height = 350;
        const margin = { top: 20, right: 20, bottom: 40, left: 10 };

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;


        const xScale = d3.scaleLinear()
            .domain([0, 1])
            .nice()
            .range([0, innerWidth]);

        const yScale = d3.scaleBand()
            .domain(data.map(d => d.label))
            .range([0, innerHeight])
            .padding(0.2);


        if (!initialised.current) {
            initialised.current = true;

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

            svg.append("text")
                .attr("class", "percent-text")
                .attr("x", width / 2)
                .attr("y", 60)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
        }


        const volumeVal = data[0].value;
        const percent = Math.round(volumeVal * 100);
        svg.select(".percent-text").text(`${percent}%`);

    }, [data]);

    return (
        <svg ref={svgRef} width={380} height={250}></svg>
    )
}

export default D3VolumeChart;
