Summary
=======

Amsterdam city real estate is experiencing a boom since a year with areas having above 20% growth in price per square meter. The center areas with prices greater than €4200 have a 2 digit increase, it's also where most of the transactions append. Still the strongest growth is for a second circle of areas with prices between €3100 and €4200. However a third circle, furtherest away with prices below €3100 has a slower on digit growth and even depreciation for one area. 


Design
======

The initial design was an viewer driven exploratory tool of the real estate of the city. The tool aimed at comparing past prices (up to 1 year) with the current property on the market. The data were scraped from the funda website which is the most prominent real estate website in the Netherlands. To facilitate the exploration the screen was divided in 4 spaces, a map was one of them. By zooming or moving the map around, the 3 other space add graphs which were dynamically adjusted to the current map position and zoom so that the viewer could have the local price trend or the most active agent in the visible area. Also on the map, a statistical analysis layer done by krigging was added to compare the current prices with past transactions. Lot of feedback was provided by a real estate investor to simplify the graphs.

After getting the comment from Udacity coach, i realised the author driven narrative was not addressed. Therefor the visualization was simplified down to simple map of the prices per square meters and a trend component was added through an animation over the quarterly evolution of prices and the volume of transactions. The animation wasn't successful in conveying a message as the average per areas didn't produce any significant change on the map. Also volume of transaction didn't appeal to different viewers. The animation would have made more sense on a longer timeline with yearly evolution but the data were not available. So instead of the animation, i rather dump the animation aspect to a more interactive component. The volume of transaction was no more displayed directly on the map but only when the viewer would explore each area. The final map only display the price per square meters with it's evolution since 1 year. 

From a technical point of view, multiple mapping technologies were used. First a full d3 map was created from Open Street Map's raw data but the level of details was too high to be quickly displayed in Javascript, indeed Amsterdam has too many canals. Secondly Google map was used, it greatly enhance the visual aesthetic but had strong limitations: 1) the map was very slow to display as generate on google server; 2) the integration with d3 were very limited. Thirdly Mapbox achieved the best result in term of performance and integration with d3 which allowed to craft a map exactly as i wanted.

From a data pipeline point of view, the data were scrapped from the Funda website and stored on a Mongodb instance. The data was cleaned, formatted and feature computed with Python scripts(Panda). Then each property was geocoded with the Google Map API. Finally the aggregated dataset was computed with a mixture of Mongodb queries and Python scripting.

Feedbacks
=========

Feedbacks for v1.0 - Viewer Driven Visualization
------------------------------------------------

From Pierre:
::
	- there are too much detail on the maps
	- the map is missing a scale
	- instead of plotting every property sold, cluster them
	- provide a zoom ability on areas. 
	- keep only have 3 price categories: low, medium and high
	- once zoomed recalibrate the 3 categories based on the 3 area
	- the agency list only make sense coupled with time period
	- do not plot incomplete month especially for volume of transactions
	- x axis of time is confusing as the 2014 is missing.
	- only provide a drop down for agency (or a top 3 for the agencies)
	- the graphs should have their y axis scale start at 0
	- the boxplot is just too complicate, rahter have the categories of room on a multiline graphes
	- which insight for the future can it provides?
	- some users also like table, can we mix graphs and table? for which data?

From Jan:
::
	- You might want to limit the real estate agent list to the top 20. If people want to see more, they could click on “more”. Otherwise it becomes such a long list
	- If that info is available, you might want to add a search filter in the real estate list on agents per price / m2, agents per geographical areas and Nr. Of transactions per year or month
	- For the transaction and price per m2 graph, you might want to show all months. This would make it a bit more comprehensive. I would also give the graphs a clear title.
	- I don’t understand the third graph.
	- I would make the graphs in general a bit more visual
	- I like the map with the points. This confirms my thoughts about expensive and cheap areas in Amsterdam

Feedbacks for v2: Still a Viewer Driven
---------------------------------------

From Mark 
::
	- it's taking a long long time to load (low bandwidth connection)
	- it needs tooltip on the graphs
	- remove/simplify the graph as they contain too much information

From Pierre
::
	- the price scale should be static and not evolved with zooming
	- the areas of amsterdam should be named and represented like "old center, north, ..."
	- the area price should appear directly (no need of over)
	- it's when zooming on an area that the property for sell shoule be displayed
	- the zooming area should be preseted and the price scale should be maintained
	- the low zoom can display future project + evolution of the areas
	- once zoomed, i would like to see "in the area the 3 bedroom flats are bulish since 3months"
	- once zoomed compare the price per square meter of this area to the global one
	- the stack bar chart is use less, too dificult to read
	- the list of agencies should allow to 1) see which one is theirs 2) allow to move to their website
	- the dots of properties should list 1) total price 2) square meters 3) rooms 4) link to the ad

From Carl (Udacity coach)
::
	- the viz is only exploratory (viewer driven) but not explanatory (author driven), the work could be integrated in a martini glass visualisation
	- the map is showing too many point, one should rather have a clusters to illustrate trends.


Feedback for v3.0: Author Driven Animation
------------------------------------------

From Thomas & Simon
::
	- the animation of the quarterly evolution is not relevant as the color on the maps are not changing at all.
	- showing the number of transaction is not relevant, one should rather focus price evolution


Feedback of v3.1: Author Driven Interactive
-------------------------------------------

From Simon
::
	- the map is clear
	- it's good to have the volume of transaction in the tooltip
	- the administrative areas are quite wide and so providing an average on very different zones especially in the north of the city. 


Resources
=========
1. Funda website http://www.funda.nl/
2. Scrapping with Scrapy http://scrapy.org/
3. For all types of graphs (line, boxplot, bar chart, ...) http://bl.ocks.org/ 
4. Integration of d3 and Mapbox https://bost.ocks.org/mike/leaflet/ 
5. Amsterdam district areas http://maps.amsterdam.nl/open_geodata/
6. Google Map Geocoding API https://developers.google.com/maps/documentation/geocoding/intro
