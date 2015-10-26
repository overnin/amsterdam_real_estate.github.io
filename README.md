==Summary== 
in no more than 4 sentences, briefly introduce your data visualization and add any context that can help readers understand it

==Design==
explain any design choices you made including changes to the visualization after collecting feedback

==Feedback==
include all feedback you received from others on your visualization from the first sketch to the final visualization

==Resources==
list any sources you consulted to create your visualization

==Pre Process==
ogr2ogr -f GeoJSON -clipsrc 4.728759 52.278172 5.079163 52.431065 places.json places.shp
Oliviers-MacBook-Pro:netherlands-latest.shp olivier$ ogr2ogr -f GeoJSON -clipsrc 4.728759 52.278172 5.079163 52.431065 roads.json roads.shp
Oliviers-MacBook-Pro:netherlands-latest.shp olivier$ ogr2ogr -f GeoJSON -clipsrc 4.728759 52.278172 5.079163 52.431065 railways.json railways.shp
Oliviers-MacBook-Pro:netherlands-latest.shp olivier$ ogr2ogr -f GeoJSON -clipsrc 4.728759 52.278172 5.079163 52.431065 waterways.json waterways.shp