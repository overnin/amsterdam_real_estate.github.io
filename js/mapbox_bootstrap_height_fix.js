function resize(){
	var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
	y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    d3.select('#map').style("height", y+"px");
}
window.onresize = resize;
