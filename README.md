==Summary== 
in no more than 4 sentences, briefly introduce your data visualization and add any context that can help readers understand it

==Design==
explain any design choices you made including changes to the visualization after collecting feedback

==Feedback==
include all feedback you received from others on your visualization from the first sketch to the final visualization
- add sketch pic -
- add R map scaterplot -

First feedback from PL:
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

First Feedback from JW:
- You might want to limit the real estate agent list to the top 20. If people want to see more, they could click on “more”. Otherwise it becomes such a long list
- If that info is available, you might want to add a search filter in the real estate list on agents per price / m2, agents per geographical areas and Nr. Of transactions per year or month
- For the transaction and price per m2 graph, you might want to show all months. This would make it a bit more comprehensive. I would also give the graphs a clear title.
- I don’t understand the third graph.
- I would make the graphs in general a bit more visual
- I like the map with the points. This confirms my thoughts about expensive and cheap areas in Amsterdam


==Resources==
list any sources you consulted to create your visualization

==Pre Process==
ogr2ogr -f GeoJSON -clipsrc 4.728759 52.278172 5.079163 52.431065 places.json places.shp
Oliviers-MacBook-Pro:netherlands-latest.shp olivier$ ogr2ogr -f GeoJSON -clipsrc 4.728759 52.278172 5.079163 52.431065 roads.json roads.shp
Oliviers-MacBook-Pro:netherlands-latest.shp olivier$ ogr2ogr -f GeoJSON -clipsrc 4.728759 52.278172 5.079163 52.431065 railways.json railways.shp
Oliviers-MacBook-Pro:netherlands-latest.shp olivier$ ogr2ogr -f GeoJSON -clipsrc 4.728759 52.278172 5.079163 52.431065 waterways.json waterways.shp