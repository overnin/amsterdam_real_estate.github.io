var realEstateViz = (function (){

  var all_data = {
    'kriging': null,
    'points': null,
    'displayed_points': null,
    'map_bounds': null}

  function init() {
    queue()
      .defer(d3.json, 'js/amsterdam_kriging.json')
      .defer(d3.json, 'js/data_amsterdam.json')
      .await(buildViz);
  }

  function buildViz(error, kriging, points) {
    if (error) throw error;
    all_data.points = points;
    all_data.kriging = kriging;
    preProcess();
    initKrigingMap();
    
    all_data.watch('map_bounds', function(id, oldval, newval) {
      all_data.displayed_points = all_data.points.filter(function(d) {
        return newval.contains(d['pos'])})
      //initSoldGraph(); 
      initSoldBarChart();  
      initPriceGraph();
      initMostActiveAgency();
      return newval;
    });
    //initSoldGraph();
    //initPriceGraph();
    //initMostActiveAgency();
  }

  function preProcess() {
    all_data.kriging.forEach(function(d) {
      sw = new google.maps.LatLng(d.lat - 0.000625 , d.lng - 0.00125);
      ne = new google.maps.LatLng(d.lat + 0.000625 , d.lng + 0.00125);
      d['bounds'] = new google.maps.LatLngBounds(sw, ne);
    });
    all_data.points.forEach(function(d) {
      d['pos'] = new google.maps.LatLng(d.lat, d.lng);
    });
  }

  function initKrigingMap() {
    var styles = [
    {
    stylers: [
        { saturation: -30 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 100 },
        { visibility: "simplified" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    },{ 
      featureType: "all",
      elementType: "labels",
      stylers: [
        {lightness: 40}]
    },{
      featureType: "poi",
      elementType: "labels",
      stylers: [
        {visibility: "off"}
      ]
    }];

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 14,
      center: {lat: 52.37, lng: 4.9},
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      scrollwheel: false,
      styles: styles
    });
    var rectangles = [];
    var labels = [];

    /*data.forEach(function(d) {
      sw = new google.maps.LatLng(d.lat - 0.000625 , d.lng - 0.00125);
      ne = new google.maps.LatLng(d.lat + 0.000625 , d.lng + 0.00125);
      d['bounds'] = new google.maps.LatLngBounds(sw, ne);
    });*/

    google.maps.event.addListener(map, 'idle', function(){
      for (var i =0; i < rectangles.length; i++) {
        rectangles[i].setMap(null);
      }
      rectangles = []
      all_data.map_bounds = map.getBounds();

      displayed_zone = all_data.kriging.filter(function(d) {
        return all_data.map_bounds.intersects(d['bounds'])})

      price_domain = d3.extent(displayed_zone, function(elt) {
        return elt['price_square_meter'];
      });

      
      var colors = d3.scale.quantize()
        .domain(price_domain)
        .range(colorbrewer.YlOrRd[3]);

      var legend = d3.select('#map-legend')
        .html("")
        .append('ul')
        .attr('class', 'list-inline');

      var keys = legend.selectAll('li.key')
        .data(colors.range());

      keys.enter().append('li')
        .attr('class', 'key')
        .style('border-top-color', String)
        .text(function(d) {
            var r = colors.invertExtent(d);
            return r[0].toFixed(0);
        });

      for (var area in displayed_zone) {
        item = displayed_zone[area];
        var spot = new google.maps.Rectangle({
          strokeColor: colors(item.price_square_meter),
          strokeOpacity: 0.2,
          strokeWeight: 0,
          fillColor: colors(item.price_square_meter),
          fillOpacity: 0.4,
          map: map,
          center: {'lat': item.lat, 'lng': item.lng},
          bounds: item.bounds,
          data: item,
          value: '€ ' + item['price_square_meter'].toFixed(0) + ' m2',
          zIndex: 0,
        });

        rectangles.push(spot);

        spot.addListener('mouseover', function() {
          var label = new MapLabel({
            text: this.value,
            position: new google.maps.LatLng(this.center.lat, this.center.lng),
            map: map,
            fontSize: 16,
            align: 'left'
          });
          labels.push(label);
        });
        spot.addListener('mouseout', function() {
          for (var i = 0; i < labels.length; i++) {
            labels[i].onRemove();
          }
          labels = []
        });
      }

      displayed_points = all_data.points.filter(function(d) {
        return all_data.map_bounds.contains(d['pos'])})
        .filter(function(r) {return (r.sold_date=="NaN" || r.sold_date==null);});

      d3.select("#property-for-sale-counter").html("").append("div")
        .text(displayed_points.length + " for sale");

      for (var index in displayed_points) {
        item = displayed_points[index];
        var spot = new google.maps.Circle({
          strokeColor: colors(item.price_square_meter),
          strokeOpacity: 1,
          strokeWeight: 1,
          fillColor: colors(item.price_square_meter),
          fillOpacity: 1,
          map: map,
          center: {'lat': item.lat, 'lng': item.lng},
          radius: 30,
          data: item,
          value: '€ ' + item['price_square_meter'] + 'm2',
          zIndex: 0,
        });
        spot.addListener('mouseover', function() {
           var label = new Label({
              map: map,
            });
          label.bindTo('position', this, 'center');
          label.bindTo('text', this, 'value');
          this.label = label; 
        });
        spot.addListener('mouseout', function() {
          this.label.onRemove();
        });
      }
    });    
  }

  //Deprecated, my be usefull to show not yet sold
  /*
  function initMap(data) {

    var styles = [
    {
    stylers: [
        { saturation: -30 }
      ]
    },{
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { lightness: 100 },
        { visibility: "simplified" }
      ]
    },{
      featureType: "road",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    },{ 
      featureType: "all",
      elementType: "labels",
      stylers: [
        {lightness: 40}]
    },{
      featureType: "poi",
      elementType: "labels",
      stylers: [
        {visibility: "off"}
      ]
    }];

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: {lat: 52.37, lng: 4.9},
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      scrollwheel: false,
      styles: styles
    });

    price_domain = d3.extent(data, function(elt) {
      return elt['price_square_meter'];
    });

    var colors = d3.scale.quantize()
      .domain(price_domain)
      .range(colorbrewer.YlOrRd[5]);

    var legend = d3.select('#map-legend')
    .append('ul')
      .attr('class', 'list-inline');

    var keys = legend.selectAll('li.key')
      .data(colors.range());

    keys.enter().append('li')
      .attr('class', 'key')
      .style('border-top-color', String)
      .text(function(d) {
          var r = colors.invertExtent(d);
          return r[0];
      });

    for (var area in data) {
      var spot = new google.maps.Circle({
        strokeColor: colors(data[area].price_square_meter),
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: colors(data[area].price_square_meter),
        fillOpacity: 1,
        map: map,
        center: {'lat': data[area].lat, 'lng': data[area].lng},
        radius: 30,
        title: 'this is it',
        data: data[area],
        value: '€ ' + data[area]['price_square_meter'] + 'm2',
        zIndex: 0,
      });
      spot.addListener('mouseover', function() {
         var label = new Label({
            map: map,
          });
        label.bindTo('position', this, 'center');
        label.bindTo('text', this, 'value');
        this.label = label; 
      });
      spot.addListener('mouseout', function() {
        this.label.onRemove();
      });
      if (area > 100) {
        return;
      }
    }
  }*/


  function initSoldGraph() {
    var parseDate = d3.time.format("%Y-%m").parse;

    //prepare data
    var per_months = d3.nest()
      .key(function(d) { 
        if (d.sold_date == null) {
          return null;
        } 
        return d.sold_date.substring(0, 7); 
      })
      .sortKeys(d3.ascending)
      .entries(all_data.displayed_points);

    per_months.forEach(function(d) {
      d['date'] = parseDate(d.key)
      d['count'] = d.values.length;
    });
    
    var today = new Date();
    thisMonthIso = today.toISOString().substring(0, 7);
    per_months = per_months.filter(function(d) {
      return (d.key != "NaN" && d.key < thisMonthIso);
    });

    //build graph
    var margin = {top: 20, right: 30, bottom: 30, left: 50},
      width = d3.select("#sold-graph").node().getBoundingClientRect().width,
      height = d3.select("#sold-graph").node().getBoundingClientRect().height,
      width = width - margin.left - margin.right,
      height = height - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);
        
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.months, 3);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function(d) { 
          return x(d.date); })
        .y(function(d) { 
          return y(d.count); });

    var svg = d3.select("#sold-graph").html("").append("svg")
          .attr("width", '100%')
          .attr("height", '100%')
          .attr('viewBox','0 0 '+Math.min(width,height + margin.top + margin.bottom)+' '+Math.min(width,height + margin.top + margin.bottom))
          .attr('preserveAspectRatio','xMinYMin')
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(per_months, function(d) { return d.date; }));
    y.domain([0, d3.max(per_months, function(d) { return d.count; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("# of transaction");

    svg.append("path")
        .datum(per_months)
        .attr("class", "line")
        .attr("d", line);
  }


  function initPriceGraph() {

    var margin = {top: 20, right: 30, bottom: 30, left: 50},
      width = d3.select("#price-graph").node().getBoundingClientRect().width,
      height = d3.select("#price-graph").node().getBoundingClientRect().height,
      width = width - margin.left - margin.right,
      height = height - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y-%m").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.months, 3);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function(d) { 
          return x(d.date); })
        .y(function(d) { 
          return y(d.median); });

    var svg = d3.select("#price-graph").html("").append("svg")
          .attr("width", '100%')
          .attr("height", '100%')
          .attr('viewBox','0 0 '+Math.min(width,height + margin.top + margin.bottom)+' '+Math.min(width,height + margin.top + margin.bottom))
          .attr('preserveAspectRatio','xMinYMin')
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var per_months = d3.nest()
      .key(function(d) { 
        if (d.sold_date == null) {
          return null;
        } 
        return d.sold_date.substring(0, 7); 
      })
      .sortKeys(d3.ascending)
      .entries(all_data.displayed_points);

    per_months.forEach(function(d) {
      d['date'] = parseDate(d.key)
      d['median'] = d3.median(d.values, function(d) {return d.price_square_meter});
    });
    
    var today = new Date();
    thisMonthIso = today.toISOString().substring(0, 7);
    per_months = per_months.filter(function(d) {
      return (d.key != "NaN" && d.key <= thisMonthIso);
    });

    x.domain(d3.extent(per_months, function(d) { return d.date; }));
    y.domain([0, d3.max(per_months, function(d) { return d.median; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("m2 in €");

    svg.append("path")
        .datum(per_months)
        .attr("class", "line")
        .attr("d", line);
  }

  //Deprecated too complex
  /*
  function initCategoryGraph(data) {    
    var margin = {top: 20, right: 30, bottom: 70, left: 50};

    var width = d3.select("#category-graph").node().getBoundingClientRect().width,
        height = d3.select("#category-graph").node().getBoundingClientRect().height,
        width = width - margin.left - margin.right;
        height = height - margin.top - margin.bottom;

    var labels = true;
    
    var min = Infinity,
        max = -Infinity;

    var per_rooms = d3.nest()
      .key(function(d) { return parseInt(d.rooms); })
      .sortKeys(d3.ascending)
      .entries(data);  

    per_rooms = per_rooms.filter(function(d) {
      return (1 <= d.key && d.key <= 4);
    })

    var extents = []
    per_rooms.forEach(function(per_room) {
      extents.push(d3.extent(per_room.values, function(d) {return d.price_square_meter}));
    });
    var min = d3.min(extents, function(d){ return d[0]});
    var max = d3.min(extents, function(d){ return d[1]})

   var chart = d3.box()
    .whiskers(iqr(1.5))
    .height(height) 
    .domain([min, max])
    .showLabels(labels);

   var svg = d3.select("#category-graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "box")    
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // the x-axis
    var x = d3.scale.ordinal()     
      .domain( per_rooms.map(function(d) { return d.key } ) )     
      .rangeRoundBands([0 , width], 0.7, 0.3);    

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    // the y-axis
    var y = d3.scale.linear()
      .domain([min, max])
      .range([height + margin.top, 0 + margin.top]);
    
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    // draw the boxplots  
    svg.selectAll(".box")    
      .data(per_rooms)
      .enter().append("g")
      .attr("transform", function(d) { 
        return "translate(" +  x(d.key)  + "," + margin.top + ")"; 
      })
      .call(chart.width(x.rangeBand())); 

     // draw y axis
    svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
      .append("text") // and text1
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "16px") 
        .text("m2 in €");    
    
    // draw x axis  
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
        .call(xAxis)
      .append("text")             // text label for the x axis
          .attr("x", (width / 2) )
          .attr("y",  20 )
      .attr("dy", ".71em")
          .style("text-anchor", "middle")
      .style("font-size", "16px") 
          .text("# of Rooms"); 
  }

  function iqr(k) {
    return function(d, i) {
      var q1 = d.quartiles[0],
          q3 = d.quartiles[2],
          iqr = (q3 - q1) * k,
          i = -1,
          j = d.length;
      while (d[++i] < q1 - iqr);
      while (d[--j] > q3 + iqr);
      return [i, j];
    };
  }
  */

  function initSoldBarChart() {
    var margin = {top: 20, right: 30, bottom: 75, left: 50},
      width = d3.select("#sold-graph").node().getBoundingClientRect().width,
      height = d3.select("#sold-graph").node().getBoundingClientRect().height,
      width = width - margin.left - margin.right,
      height = height - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);  

    var y = d3.scale.linear()
        .rangeRound([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.time.format("%Y-%m"))

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var svg = d3.select("#sold-graph").html("").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var parseDate = d3.time.format("%Y-%m").parse;

    color.domain(['1', '2', '3', '4', '5']);

    //prepare data
    var per_months = d3.nest()
      .key(function(d) { 
        if (d.sold_date == null) {
          return null;
        } 
        return d.sold_date.substring(0, 7); 
      })
      .sortKeys(d3.ascending)
      /*.key(function(d) {
        return d.rooms
      })
      .sortKeys(d3.ascending)*/
      .entries(all_data.displayed_points);

    per_months.forEach(function(d) {
      var y0 = 0;
      d.date = parseDate(d.key);
      d.rooms = []
      for (var i = 1; i<=4; i++) {
        d.rooms[i] = d.values
          .filter(function(r) {return r.rooms==i})
          .length
      }
      d.rooms.push(d['values'].filter(function(r) {return 5 <= r.rooms;}).length)
      d.rooms = color.domain().map(function(name) { 
        return {
          name: name, 
          y0: y0, 
          y1: y0 += +d.rooms[name]}; 
      });
      d.total = d.rooms[d.rooms.length - 1].y1;
    });
    
    var today = new Date();
    thisMonthIso = today.toISOString().substring(0, 7);
    per_months = per_months.filter(function(d) {
      return (d.key != "NaN" && d.key < thisMonthIso);
    });

    x.domain(per_months.map(function(d) { return d.date; }));
    y.domain([0, d3.max(per_months, function(d) { return d.total; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)" );

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("# sold");

    var date_bar = svg.selectAll(".date-bar")
        .data(per_months)
      .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) { 
          return "translate(" + x(d.date) + ",0)"; });

    date_bar.selectAll("rect")
        .data(function(d) { return d.rooms; })
      .enter().append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d) { 
          return y(d.y1); })
        .attr("height", function(d) { 
          return y(d.y0) - y(d.y1); })
        .style("fill", function(d) { 
          return color(d.name); });

    var legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
  }


  function initMostActiveAgency() {
    var per_agencys = d3.nest()
      .key(function(d) { 
        if (d.agency == '' || d.agency == null) {
          return null;
        } 
        return d.agency; 
      })
      .entries(all_data.displayed_points);

    per_agencys.forEach(function(d) {
      d.values = d.values.filter(function(r) {
        return (r.sold_date=="NaN" || r.sold_date==null);});
      d.values = d.values.length;
    });
    
    per_agencys = per_agencys.filter(function(d) {
      return (d.key != "NaN" && d.key != null && d.values > 0);
    });

    per_agencys = per_agencys.sort(function(a, b){ 
      return d3.descending(a.values, b.values); 
    });

    d3.select('#most-active').html("")
    if (per_agencys.length == 0) {
      d3.select('#most-active').append('div')
      .text("Sorry, none of the agencies are currently selling here.")
    }
    var visible = 0;
    per_agencys.forEach(function(d){
      if (visible < 10) {
        d3.select('#most-active').append('div')
          .attr("style","background-color:#fec44f; margin-bottom:1px;")
          .text(d.key + ' has ' +d.values+ ' offers.');
      } else {
        d3.select('#most-active').append('div')
          .attr("style","background-color:#fec44f; margin-bottom:1px;display:none")
          .text(d.key + ' has ' +d.values+ ' offers.');
      }
      visible++;
    })
  }

  return {
    'init': init}
})();