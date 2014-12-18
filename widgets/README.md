
This folder contains widgets that shared by the community. If you would like to share your widgets to the community, please upload them here.  

## How to add widgets into Web AppBuilder or a built app
To add widgets into the builder or an app, follow these steps:

1. Open manifest.json file in the widget folder. It describes widget properties as shown in the following table.
2. Modify the properties accordingly.
3. Save the file.
4. Copy the widget folder and paste it to the widgets repository. By default, the widgets repository is located under \client\stemapp\widgets folder. In this way, your widget is available to the builder. 
5. If you prefer to deploy the widget to a specific app only, you can copy the widget folder and paste it to the widgets folder within the downloaded app, then edit the app config file to include this widget to the app.

## Widget development
Web AppBuilder for ArcGIS is built with ArcGIS API for JavaScript and Dojo. It allows you to customize and extend functionalities by creating your own widgets and themes.

To develop your own widgets, have an [overview](http://developers.arcgis.com/web-appbuilder/guide/developer-s-guide-overview.htm) of related concepts, then follow the [development guide](http://developers.arcgis.com/web-appbuilder/guide/naming-conventions.htm) for more information. 
