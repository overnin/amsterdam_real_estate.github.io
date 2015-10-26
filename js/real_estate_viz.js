var realEstateViz = (function (){

  function init() {
    d3.json('js/data_amsterdam.json', function(error, data) {
      if (error) throw error;
      initMap(data);
      initSoldGraph(data);
      initPriceGraph(data);
      initCategoryGraph(data);
      initMostActiveAgency(data);
    });
  }

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

    for (var property in data) {
      var spot = new google.maps.Circle({
        strokeColor: colors(data[property].price_square_meter),
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: colors(data[property].price_square_meter),
        fillOpacity: 1,
        map: map,
        center: {'lat': data[property].lat, 'lng': data[property].lng},
        radius: 30,
        title: 'this is it',
        data: data[property],
        value: '€ ' + data[property]['price_square_meter'] + 'm2',
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
      if (property > 7000) {
        return;
      }
    }
  }


  function initSoldGraph(data) {

    var margin = {top: 20, right: 30, bottom: 30, left: 50},
      width = d3.select("#sold-graph").node().getBoundingClientRect().width,
      height = d3.select("#sold-graph").node().getBoundingClientRect().height,
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
          return y(d.count); });

    var svg = d3.select("#price-graph").append("svg")
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
      .entries(data);

    per_months.forEach(function(d) {
      d['date'] = parseDate(d.key)
      d['count'] = d.values.length;
    });
    
    var today = new Date();
    thisMonthIso = today.toISOString().substring(0, 7);
    per_months = per_months.filter(function(d) {
      return (d.key != "NaN" && d.key <= thisMonthIso);
    });

    x.domain(d3.extent(per_months, function(d) { return d.date; }));
    y.domain(d3.extent(per_months, function(d) { return d.count; }));

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


  function initPriceGraph(data) {

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

    var svg = d3.select("#price-graph").append("svg")
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
      .entries(data);

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
    y.domain(d3.extent(per_months, function(d) { return d.median; }));

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


  function initMostActiveAgency(data) {
    var per_agencys = d3.nest()
      .key(function(d) { 
        if (d.agency == '' || d.agency == null) {
          return null;
        } 
        return d.agency; 
      })
      .entries(data);

    per_agencys.forEach(function(d) {
      d.values = d.values.length;
    });
    
    per_agencys = per_agencys.filter(function(d) {
      return (d.key != "NaN" && d.key != null);
    });

    per_agencys = per_agencys.sort(function(a, b){ 
      return d3.descending(a.values, b.values); 
    });

    d3.select('#most-active').append('div')
      .text("Most selling agencies")

    per_agencys.forEach(function(d){
      d3.select('#most-active').append('div')
        .attr("style","background-color:#fec44f; margin-bottom:1px;")
        .text(d.key + ' - ' +d.values);

    })
  }

  return {
    'init': init}
})();