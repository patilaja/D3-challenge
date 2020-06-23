//Data path
const url = "./assets/data/data.csv";

//Set canvas size
var svgWidth = 960;
var svgHeight = 800;

//Set up svg chartMargins
var margin = {
    top: 20,
    right: 20,
    bottom: 90,
    left: 100
};

//Calculcate chart width/height
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Circle radius
const circleRadius =15;

//Append chart area to canvas
const svg = d3.select('#scatter').append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

//Append chart group 
var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

//Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

//Function - Update x-scale  
function xScale(acsData, chosenXAxis) {
  //Create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(acsData, d => d[chosenXAxis])*.9, d3.max(acsData, d => d[chosenXAxis])*1.1 ])
    .range([0, width]);

  return xLinearScale;
}

//Function - Update y-scale  
function yScale(acsData, chosenYAxis) {
    //Create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(acsData, d => d[chosenYAxis])*0.9, d3.max(acsData, d => d[chosenYAxis])*1.1])
      .range([height, 0]);
  
    return yLinearScale;
  }

//Function - Update xAxis
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis = chartGroup.select('g')
        .attr('transform', `translate(0, ${height})`)
        .transition(100000)
        .call(bottomAxis);

  return xAxis;
}

//Function - Update yAxis
function renderYAxes(yLinearScale, yAxis) {
 
    var leftAxis  = d3.axisLeft(yLinearScale);

    svg.select("#y-axis")
    	.transition(100000)
	    .call(leftAxis);

    return yAxis;
  }

//Function - Render circles group with a transition to new circles 
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {

     circlesGroup.transition()
       .duration(1000)
       .attr("cx", d => newXScale(d[chosenXaxis]))
       .attr("cy", d => newYScale(d[chosenYaxis]));
  
    return circlesGroup;
  }

//Function - Clear previous text and render text group with a new state abbreviations 
function renderText(data, textGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {

    //Clear screen abbreviation text
    d3.selectAll("#sAbbr")
      .remove();

    //Get State abbrevations for the selected data
    textGroup = chartGroup.selectAll('stext')
     .data(data)
     .enter()
     .append('text')
     .text(d=> d.abbr)
     .attr('x', d => newXScale(d[chosenXAxis]))
     .attr('y', d => newYScale(d[chosenYAxis])+3)
     .attr("id","sAbbr")
     .attr('text-anchor', 'middle')
     .attr("font-family", "sans-serif")
     .attr("font-size", "10px")
     .attr("fill", "white")
     .exit();   

    return textGroup;
    }

//Function - Update Tooltip  
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var per="%";

  //Check what access is selected to determine label
    if (chosenXAxis === "poverty") {
        var xlabel = "In Poverty";
    }
    else if (chosenXAxis === "age") {
        var xlabel = "Median age";
        per="";
    } 
    else if (chosenXAxis === "income") {
        var xlabel = "Median Household Income";
        per="";
    }
    
    if (chosenYAxis === "healthcare") {
        var ylabel = "Lacks healthcare";
      }
    else if (chosenYAxis === "smokes") {
        var ylabel = "Smoking";
      } 
    else if (chosenYAxis === "obesity") {
        var ylabel = "Obesity";
      }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}${per}<br>${ylabel}: ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  //Tooltip show - onmouseover event
  circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
     })

    //Tooltip hide - onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

//Retrieve data from the CSV file and Steps to populate the scatter plot
d3.csv(url).then(function(data, err) {
  if (err) throw err;

    // 1. Transform string data elements from csv as numbers
    data.forEach(function(d) {
        d.age = +d.age;
        d.income = +d.income;
        d.healthcare = +d.healthcare;
        d.poverty = +d.poverty;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
    });

    //2: Create Scales
    // xLinearScale function  
    var xLinearScale = xScale(data, chosenXAxis);

    // yLinearScale function  
    var yLinearScale = yScale(data, chosenYAxis) ;

    // 3: Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // 4: Append Axes to Chart
    // append x axis
    var xAxis = chartGroup.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append('g')
        .attr("id", "y-axis")
        .call(leftAxis);
    
     // 5: Create Circles -append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', circleRadius)
        .attr('fill', 'skyblue')
        .attr("opacity", ".6");

    //6. Create state Abbrevations labels that goes inside circle   
    var textGroup = chartGroup.selectAll('stext')
        .exit()
        .data(data)
        .enter()
        .append('text')
        .text(d=> d.abbr)
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis])+3)
        .attr("id", "sAbbr")
        .attr('text-anchor', 'middle')
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("fill", "white")
        .exit();
   
    // 7: Create Axes Labels

    // Create group for  x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    // Create group for  y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 40})`);
    
    //Create x-axis lables and define position
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 30)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 50)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var householdLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 70)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Householde Income (Median)");        

    //Create y-axis lables and define position
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (width/2) + 700)
        .attr("y", 0 - (height / 2)-110)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Heathcare (%)");

    var smokeLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (width/2) + 700)
        .attr("y", 0 - (height / 2)-130)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var obsseeLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (width/2) + 700)
        .attr("y", 0 - (height / 2)-150)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity (%)");

  // 8. UpdateToolTip function above csv import
   circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  //Event handling part -starts here

  //1. x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        //console.log(chosenXAxis)

         // updates x scale for new data
         xLinearScale = xScale(data, chosenXAxis);

         // updates x axis with transition
         xAxis = renderXAxes(xLinearScale, chosenXAxis);
 
         // updates circles with new x values
         circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
 
         //Update Text data
          textGroup= renderText(data, textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

         //console.log(circlesGroup);

         // updates tooltips with new info
         circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
 

       // changes classes to change bold text
        if (chosenXAxis === "poverty") {
            povertyLabel
               .classed("active", true)
               .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            householdLabel
              .classed("active", false)
              .classed("inactive", true); 
        }
        else if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            householdLabel
              .classed("active", false)
              .classed("inactive", true);              
          }
        else if (chosenXAxis === "income") {
            householdLabel
                .classed("active", true)
                .classed("inactive", false);
            povertyLabel
                .classed("active", false)
                .classed("inactive", true);
            ageLabel
                .classed("active", false)
                .classed("inactive", true);                
        }
      }
    });

//y axis labels event listener
 ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        //console.log(chosenYAxis)

        // updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates y axis with transition
        var yAxis = renderYAxes(yLinearScale, chosenYAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //Update Text data
        textGroup= renderText(data, textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //console.log(circlesGroup);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

       // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
            healthcareLabel
               .classed("active", true)
               .classed("inactive", false);
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            obsseeLabel
              .classed("active", false)
              .classed("inactive", true); 
        }
        else if (chosenYAxis === "smokes") {
            smokeLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            obsseeLabel
              .classed("active", false)
              .classed("inactive", true);              
          }
        else if (chosenYAxis === "obesity") {
            obsseeLabel
                .classed("active", true)
                .classed("inactive", false);
            smokeLabel
                .classed("active", false)
                .classed("inactive", true);
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);                
        }
      }
    })
}).catch(function(error) {
  console.log(error);
});

