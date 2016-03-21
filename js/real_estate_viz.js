var realEstateViz = (function() {

  var center_lng = 4.9,
      center_lat = 52.36,
      month_index = 6,
      month_compare_index = 2,
      radius_limit = 10;

  NL = d3.locale({
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["€", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%m/%d/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  });


  function init() {
    resize();
    queue()
      .defer(d3.json, "json/amsterdam_admin_level_3_aggregate.json")
      .await(build_viz);
  }

  function filter_aggregates(aggregates) {
    aggregates_filtered = aggregates.filter(function(d) {
      length = d["stats_per_month"].length - 1;
      return d["stats_per_month"][length]["price_square_meter_mean"] != null;
    });
    return aggregates_filtered; 
  }

  function get_price_color_scale(aggregates) {
    aggregates_filtered = filter_aggregates(aggregates);

    price_domain = d3.extent(aggregates_filtered, function(elt) {
      length = elt["stats_per_month"].length - 1;
      return elt["stats_per_month"][length]["price_square_meter_mean"];
    });

    return d3.scale.quantize()
      .domain(price_domain)
      .range(colorbrewer.OrRd[3]);
  }

  function preprocess(aggregates) {
    aggregates.forEach(function(d) {
      d.LatLng = new L.LatLng(d.representative_point.coordinates[1], d.representative_point.coordinates[0]);
      d.type = "Feature"; // to move in python
    });
    return aggregates;
  }

  function build_viz(error, aggregates) {
    if (error) return console.error(error);

    preprocess(aggregates);
    var aggregates_filtered = filter_aggregates(aggregates),
        price_color = get_price_color_scale(aggregates_filtered);

    L.mapbox.accessToken = "pk.eyJ1Ijoib2xpdmllcnZlcm5pbiIsImEiOiJjaWtzNjk5MXcwYXh6dW1tMWlubTlyc2JyIn0.aub3AlNziJHJh8TvhhOUJw";
    var map = L.mapbox.map("map", "mapbox.streets")
      .setView([center_lat, center_lng], 12);

    var svg = d3.select(map.getPanes().overlayPane)
      .append("svg")
      .style("position", "relative");

    // Append <g> to svg
    var g = svg
      .append("g")
      .attr("class", "leaflet-zoom-hide");

    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    var transform = d3.geo.transform({point: projectPoint}),
        path      = d3.geo.path().projection(transform);

    var paths_container   = g.append("g").attr("id", "paths"),
        circles_container = g.append("g").attr("id", "circles"),
        details_container = g.append("g").attr("id", "details");

    var paths = paths_container.selectAll("path")
      .data(aggregates)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function(d) {
        length = d["stats_per_month"].length - 1;
        if (d["stats_per_month"][length]["price_square_meter_mean"] == null) {
          return "lightgrey";
        }
        return price_color(d["stats_per_month"][length]["price_square_meter_mean"]);})
      .style("opacity", ".7")
      .attr("stroke-width", "1")

    var circle_container = circles_container.selectAll(".circle")
      .data(aggregates)
      .enter()
      .append("g")
      .attr("class", "circle")

    circle_container
      .append("circle")
      .style("stroke", "grey")
      .style("stroke-width", "1")
      circle_container
      .append("text")
      .attr("text-anchor", "middle")

    var details = details_container.selectAll(".detail")
      .data(aggregates, function(d) {return d["name"];})
      .enter()
      .append("g")
      .style("opacity", "0")
      .style("visibility", "hidden")
      .style("pointer-event", "none")

    var boxes = details
      .append("rect")
      .style("fill", "white")
      .attr("x", "0")
      .attr("y", "-10")
      .attr("height", "100")
      .attr("width", "200")

    var texts = details
      .append("text")
      .attr("x", "5")
      .attr("y", "5")

    map.on("viewreset", reset);
    reset();

    function reset() {
      var bounds = path.bounds({"type": "FeatureCollection", "features":aggregates}),
          topLeft = bounds[0],
          bottomRight = bounds[1];

      svg.attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");

      g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

      paths.attr("d", path);

      circles_container.selectAll(".circle")
        .attr("transform", function(d) {
          x = map.latLngToLayerPoint(d.LatLng).x;
          y = map.latLngToLayerPoint(d.LatLng).y;
          return "translate("+ x +" "+ y +")"})
      circles_container.selectAll(".circle").selectAll("circle")
        .attr("r", get_radius)
        .attr("fill", get_color)
      circles_container.selectAll(".circle").selectAll("text")
        .text(get_percent_rounded)
        .attr("text-anchor", get_label_anchor)
        .attr("fill", get_label_color)
        .attr("font-size", get_label_size)
        .attr("transform", get_label_position)

      details.attr("transform", function(d) {
        x = map.latLngToLayerPoint(d.LatLng).x + 10;
        y = map.latLngToLayerPoint(d.LatLng).y;
        return "translate("+ x +" "+ y +")"})

      texts.html(get_text);
    }

    function entering_area(d) {
      details.filter(function(area) {
        return d["name"] == area["name"];})
        .style("visibility", "visible")
        .transition()
        .delay(100)
        .duration(400)
        .style("opacity", ".9")
      
      d3.select(this).attr("stroke", "black");
    }
    
    function exiting_area(d) {
      details.filter(function(area) {
        return d["name"] == area["name"];})
        .transition()
        .delay(100)
        .duration(200)
        .style("opacity", "0")
        .style("visibility", "hidden");
      
      d3.select(this).attr("stroke", "none");
    }

    function entering_detail(d) {
      details.filter(function(area) {
          return d["name"] == area["name"];})
       .style("visibility", "visible")
       .transition()
       .delay(100)
       .duration(400)
       .style("opacity", ".9")

       paths.filter(function(area) {
         return d["name"] == area["name"];})
       .attr("stroke", "black");
    }

    function exiting_detail(d) {
      details.filter(function(area) {
        return d["name"] == area["name"];})
        .transition()
        .delay(100)
        .duration(200)
        .style("opacity", "0")
        .style("visibility", "hidden");

      paths.filter(function(area) {
        return d["name"] == area["name"];})
          .attr("stroke", "none");
    }


    function entering_circle(d) {
      details.filter(function(area) {
          return d["name"] == area["name"];})
       .style("visibility", "visible")
       .transition()
       .delay(100)
       .duration(400)
       .style("opacity", ".9")

       paths.filter(function(area) {
         return d["name"] == area["name"];})
       .attr("stroke", "black");

    }

    function exiting_circle(d) {
      details.filter(function(area) {
        return d["name"] == area["name"];})
        .transition()
        .delay(100)
        .duration(200)
        .style("opacity", "0")
        .style("visibility", "hidden");

      paths.filter(function(area) {
        return d["name"] == area["name"];})
          .attr("stroke", "none");
    }

    paths
      .on("mouseenter", entering_area)
      .on("mouseleave", exiting_area);

    details
      .on("mouseenter", entering_detail)
      .on("mouseleave", exiting_detail);

    circle_container
      .on("mouseenter", entering_circle)
      .on("mouseleave", exiting_circle);

    function get_percent(d) {
      if (d["stats_per_month"][month_index]["price_square_meter_mean"] == null) {
        return 0;
      }
      return precentage_increase(d["stats_per_month"][month_compare_index]["price_square_meter_mean"], d["stats_per_month"][month_index]["price_square_meter_mean"]);
    }

    function get_percent_rounded(d) {
      percent = get_percent(d);
      if (Math.abs(percent) >= .01) { 
        return NL.numberFormat("+%")(get_percent(d));
      }
      return NL.numberFormat("+.1%")(get_percent(d));
    }

    function get_radius(d) {
      percent = get_percent(d)
      //return 0.001* Math.sqrt(d.stats_per_month[month_index].sold_percent * 100) * Math.pow(2, map.getZoom());
      return  Math.sqrt(0.5 * Math.abs(percent) * Math.pow(2, map.getZoom())) ;
    }

    function get_color(d) {
      percent = get_percent(d)
      color = "red";
      if (percent > 0) {
        color = "green";
      }
      return color;
    }

    function get_label_anchor(d) {
      r = get_radius(d)
      if (r > radius_limit) {
        return "middle";
      }
      return "start"; 
    }

    function get_label_size(d) {
      r = get_radius(d)
      if (r > radius_limit) {
        return r/2 +2;
      }
      return 10; 
    }

    function get_label_color(d) {
      r = get_radius(d)
      if (r > radius_limit) {
        return "white";
      } 
      return "black";
    }

    function get_label_position(d){
      r = get_radius(d)
      if (r > radius_limit) {
        return "translate(0 3)";
      }
      return "translate("+(r+5)+" 3)"; 
    }

    function get_text(d) {
      detail = '<tspan x="3" style="text-decoration:underline;font-size:1.5em;">' +d["name"]+ '</tspan>'
      detail += '<tspan x="3" y="1.8em">' + NL.numberFormat("$f")(d.stats_per_month[month_index].price_square_meter_mean) + ' m2</tspan>';
      percent = precentage_increase(d.stats_per_month[month_compare_index].price_square_meter_mean, d.stats_per_month[month_index].price_square_meter_mean)
      if (percent > 0) {
        color = "green";
      } else {
        color = "red";
      }
      detail += '<tspan style="stroke:'+color+'">  ' + NL.numberFormat("+.2%")(percent) + '</tspan>';

      detail += '<tspan x="3" y="3em">' + d.stats_per_month[month_index].sold_count + ' sold properties</tspan>';
      percent = precentage_increase(d.stats_per_month[month_compare_index].sold_percent, d.stats_per_month[month_index].sold_percent)
      if (percent > 0) {
        color = "green";
      } else {
        color = "red";
      }
      detail += '<tspan style="stroke:'+color+'">  ' + NL.numberFormat("+.2%")(percent) + '</tspan>';
      return detail;
    }

    function round_2decimal(a) {
      return Math.round(100 * a) / 100;
    }

    function precentage_increase(a, b) {
      return ((b-a) / a);
    }
  }

  return {
    "init": init
  };

})();