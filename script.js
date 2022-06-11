// api render
var data = {
    resource_id: '83c21090-bd19-4b54-ab6b-d999c251edcf', 
};
$.ajax({
url: 'https://data.gov.sg/api/action/datastore_search?',
jsonp: false,
data: data,
success: function(data) {
    var pos_data = data;
    var reference_id = "#my_dataviz";
    plot_diagram(reference_id, pos_data);
}
});

async function jsonParse() {
    let items = await fetchAPI()
    // set the json as an object
    const obj = JSON.parse(items)
  
    // filter the object to get the data
    var values = obj.result.records
    return values
  }

// tooltip
var tooltip = d3
    .select('#my_dataviz')
    .append('div')
    .style('opacity', 0)
    .attr('class', 'tooltip')
    .style('background-color', 'white')
    .style('border', 'solid')
    .style('border-width', '1px')
    .style('border-radius', '5px')
    .style('padding', '10px')

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


// A function that create / update the plot for a given variable:
function update(svg, innerYear, i, x, y, height){
    
    
    var u = svg.selectAll("rect")
                   .data(innerYear.get(i))
    
    u.enter()
            .append("rect")
            .on('mouseover', function(event,d) {
                div.transition()
                  .duration(200)
                  .style("opacity", .9);
                div.html('Crime: ' + (d.level_2) + "<br/>" + 'Count: ' +(d.value) )
                  .style("left", (event.pageX) + "px")
                  .style("top", (event.pageY - 28) + "px");
                })
            .on("mouseout", function(d) {
                div.transition()
                  .duration(500)
                  .style("opacity", 0);
                })
            .merge(u)
            .transition()
            .duration(1000)
            .attr("x", function(d) { 
                return x(d.level_2); 
            })
            .attr("y", function(d) { 
                return y(d.value); 
            })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { 
                return height - y(d.value); 
            })
            .attr("fill", "#0000FF")
}


function plot_diagram(ref, pos_data){

    var content =  pos_data.result.records
    
    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 30, bottom: 60, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;


    // append the svg object to the body of the page
    var svg = d3.select(ref)
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

    
    let nestedData = d3.group(content, d => d.level_2)
    
    // X axis
    let x = d3.scaleBand()
                    .range([0, width])
                    .domain(Array.from(nestedData.keys()))
                    .padding(0.2);
                   
    
    // Add Y axis
    let y = d3.scaleLinear()
                   .domain([0,10000])
                   .range([height, 0]);

    let xAxis = svg.append("g")
                   .attr("transform","translate(0," + height + ")")
                   .call(d3.axisBottom(x));

    let yAxis = svg.append("g")
                   .call(d3.axisLeft(y));
    
    // text label for the x axis
    svg.append("text")
        .attr("y", 0 - margin.top)
        .attr("x", (width / 2))
        .attr("dy", "1em")
        .attr("font-weight", "bold")
        .attr("font-size", "18px")
        .style("text-anchor", "middle")
        .text("Cases Recorded for Selected Major Offences");  


    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .attr("font-size", "14px")
        .style("text-anchor", "middle")
        .text("Cases Recorded for Crimes"); 
    
        let innerYear = d3.group(content, d => d.year)
        
        var dropdownButton = d3.select("#dropdownMenuButton")
                            .text(Array.from(innerYear.keys()).at(-1))

        var dropdown_content = d3.select(".dropdown-menu")
                                .selectAll("a")
                                .data(Array.from(innerYear.keys()).slice(0,-1)) 
                                .enter()
                                .append("a")
                                .attr("class", "dropdown-item")
                                .attr("href", "#")
                                .on('click', function(d, i) {
                                    dropdownButton.text(i)
                                    update(svg, innerYear, i, x, y, height)
                                })  
                                .text(function (d) {
                                    return d;
                                });
        update(svg, innerYear, "2020", x, y, height)
}