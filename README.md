==Summary== 
in no more than 4 sentences, briefly introduce your data visualization and add any context that can help readers understand it

Since a year, the prices have strongly increase within the central area with 2 digits. 
Few upcomming areas are expriencing an even stronger increase at the edge of the central area with more than 20%. 
Altough most of the areas at the rim of the city are increasing at a lower pace, few are not 

==Design==
explain any design choices you made including changes to the visualization after collecting feedback

The initial design was to provide an exploratory tool to explore real estate opportunities the city.
To facilitate the exploration the screen was devided in 4 spaces, the map was one of them. 
By zooming or moving the map, the 3 other spaces were recalculated to provide price evolution or most active agent in the visible area.
A statistical analysis of past offers was contextualizing the price of the offers.
This initial disgn was very interactive with the map as a control.

After getting the comment from Udacity coach, i reconsider the approach to deliver a exploratory visualization.
To simplify the message, the current offer were dumped and the viz only work on the evolution of the price per square meter. 
The city areas are devided on a 3 price scale. 
On top are displayed the evolution of this price since 1 year.

From a pure technical point of view, multiple technics were used. First a d3 map was created from openstreetmap osm data but the level of detail was too high to be quickly displayed in JS (amsterdam has too many canals).
In a second step, Google map was used, it greately enhance the visual aesthetic but has strong limitations. 1) the map was very slow to display as generate on google server 2) the graphic capabilites integrate with d3 were very limited.
Finaly though the Mapbox, the best result was achieve in term of peformance and integration with d3.


==Feedback==
include all feedback you received from others on your visualization from the first sketch to the final visualization
- add sketch pic -
- add R map scaterplot -

===Feedback v1.0==
from PL:
- too much detail on the maps
- map is missing a scale
- instead of plotting every poperty sold, cluster them
- provide a zoom ability on "quartier": historic, business, adminstrative... 
- only have 3 categories: low, medium and high
- once zoomed recalibrate the 3 categories based on the 3 area
- agency list only make sense coupled with time periode
- do not plot incomplete month especially for # of transactions
- x axis of time is confusing as the 2014 is missing.
- only provide a drop down (or a top 3 for the agencies)
- graphs should have their y axis scale start at 0
- boxplot is just too complicate, rahter have the categories of room on a multiline graphe
- which insight for the future can it provides
- some users also like table, can we mix graphs and table? for which data?

from JW:
- You might want to limit the real estate agent list to the top 20. If people want to see more, they could click on “more”. Otherwise it becomes such a long list
- If that info is available, you might want to add a search filter in the real estate list on agents per price / m2, agents per geographical areas and Nr. Of transactions per year or month
- For the transaction and price per m2 graph, you might want to show all months. This would make it a bit more comprehensive. I would also give the graphs a clear title.
- I don’t understand the third graph.
- I would make the graphs in general a bit more visual
- I like the map with the points. This confirms my thoughts about expensive and cheap areas in Amsterdam

==Feedback v2.2==
from Mark (low bandwidth connection)
- long time to load
- need tooltip on the graphs
- remove/simplify the 

From Carl (Udacity coach):
- the viz is only exploratory but not explanatory, the work could be integrate in a martini glass viz

From PL:
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
- 

==v3.0==
Changes:
- switch from google map to mapbox
- remove the krigging layer
- identify amsterdam district border
- use bubbles to visualize the number of transaction

from Thomas:
- showing the number of transaction is not relevant, one shoud rather focus price evolution

==v3.1==
Changes:
- visualize price per square meter and district 


==Resources==
list any sources you consulted to create your visualization
1) google map API
2) http://bl.ocks.org/ for all types of graphs (line, boxplot, bar chart, ...)
3) various JS tricks online, see in each file for detailed references: object-watch.js, maplabel-compiled.js, label.js
4) openstreetdata for initial attempt to build a map in d3 (abandoned due to difficulties in using low level geoData)
5) amsterdam district areas  http://maps.amsterdam.nl/open_geodata/

==TODO==
3) About the show the Kriging evolution
4) Graph tooltip is necessary
5) be able to show agencies property highli on the map
6) clike on the map point to see the link to it
7) about page to indicate
    - origin of the data
    - preprocess on the data
8) fix the legend of the bar stack trace (5+ rooms and )
9) uniforme x axis of both graphs
10) decimal on scale, + reduce number of ticks
11) issue of zindex between properties and areas

==Done==
1) Compute a Kriging with only sold properties
2) Kriging layer displayed should be indicate on the viz,
