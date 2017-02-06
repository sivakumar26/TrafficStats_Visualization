//consuming rest services
var dict = {};
var pack = {};
(function () {
    function DataFetcher(urlFactory, delay) {
        var self = this;

        self.repeat = false;
        self.delay = delay;
        self.timer = null;
        self.requestObj = null;

        function getNext() {
            self.requestObj = $.ajax({
                url: urlFactory()
            }).done(function (response) {
                $(self).trigger("stateFetchingSuccess", {
                    result: response
                });
            }).fail(function (jqXHR, textStatus, errorThrown) {
                $(self).trigger("stateFetchingFailure", {
                    error: textStatus
                });
            }).always(function () {
                
                var jsonarray = [];
                for (var key in dict) {
                    if (dict.hasOwnProperty(key)) {
                        jsonarray.push({srcObj:key,value:dict[key]});
                    }
                }
                drawtrafficcharts(JSON.stringify(jsonarray));
                var jsonarray2 = [];
                for (var key in pack) {
                    if (pack.hasOwnProperty(key)) {
                        jsonarray2.push({srcObj:key,value:pack[key]});
                    }
                }
                drawpacketcharts(JSON.stringify(jsonarray2));
                
                if (self.repeat && _.isNumber(self.delay)) {
                    self.timer = setTimeout(getNext, self.delay);
                }
            });
        }

        self.start = function (shouldRepeat) {
            self.repeat = shouldRepeat;
            getNext();
        };

        self.stop = function () {
            self.repeat = false;
            clearTimeout(self.timer);
        };

        self.repeatOnce = function () {
            getNext();
        };

        self.setDelay = function (newDelay) {
            this.delay = newDelay;
        };
    }

    function addNewEntry($container, contentHTML) {
        var $innerSpan = $("<p/>").text(contentHTML),
            $newEntry = $("<li/>").append($innerSpan);

        $container.append($newEntry);
    }

    var $trafficStatusList = $("#mockTrafficStat"),
        df2 = new DataFetcher(function () {
            return "/traffic_status";
        });

    $(df2).on({
        "stateFetchingSuccess": function (event, data) {
            data.result.data.forEach(function (dataEntry) {
                //addNewEntry($trafficStatusList, JSON.stringify(dataEntry));
                //  console.log(dataEntry);

                if (!isNaN(dict[dataEntry.scrObj])) {
                    dict[dataEntry.srcObj] = dataEntry.traffic + dict[dataEntry.srcObj];
                } else {
                    dict[dataEntry.srcObj] = dataEntry.traffic;
                }
                 if (!isNaN(pack[dataEntry.destObj])) {
                    pack[dataEntry.destObj] = dataEntry.packets + pack[dataEntry.destObj];
                } else {
                    pack[dataEntry.destObj] = dataEntry.packets;
                }
            });
        },
        "stateFetchingFailure": function (event, data) {
            addNewEntry($trafficStatusList, JSON.stringify(data.error));
            addNewEntry($trafficStatusList, "Hit a snag. Retry after 1 sec...");
            setTimeout(function () {
                $trafficStatusList.html("");
                df2.repeatOnce();
            }, 1000);
        }
    });

    df2.start();

})();


function drawtrafficcharts(jsonstring) {
    // set the dimensions of the canvas
    var margin = {
            top: 20,
            right: 20,
            bottom: 70,
            left: 40
        },
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;


    // set the ranges
    var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

    var y = d3.scale.linear().range([height, 0]);

    // define the axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")


    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    

    // add the SVG element
    var svg = d3.select("#chart-03").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // load the data
    //d3.json("data.json", function(error, data) {

    //var arr = []
    //arr.push(JSON.parse(jsonstring));
    //console.log(arr);
    data = JSON.parse(jsonstring);
   // console.log(data);
    data.forEach(function (d) {
        d.srcObj = d.srcObj;
        d.value = +d.value;
    });

    // scale the range of the data
    x.domain(data.map(function (d) {
        return d.srcObj;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);

    // add axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Traffic");


    // Add bar chart
    svg.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.srcObj);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value);
        });

    //} );
}

function drawpacketcharts(jsonstring) {
    // set the dimensions of the canvas
    var margin = {
            top: 20,
            right: 20,
            bottom: 70,
            left: 40
        },
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;


    // set the ranges
    var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

    var y = d3.scale.linear().range([height, 0]);

    // define the axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")


    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    

    // add the SVG element
    var svg = d3.select("#chart-04").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    // load the data
    //d3.json("data.json", function(error, data) {

    //var arr = []
    //arr.push(JSON.parse(jsonstring));
    //console.log(arr);
    data = JSON.parse(jsonstring);
   // console.log(data);
    data.forEach(function (d) {
        d.srcObj = d.srcObj;
        d.value = +d.value;
    });

    // scale the range of the data
    x.domain(data.map(function (d) {
        return d.srcObj;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);

    // add axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Packets");


    // Add bar chart
    svg.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
            return x(d.srcObj);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value);
        });

    //} );
}

