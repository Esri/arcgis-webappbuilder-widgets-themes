# Overview #
ArcGIS WebApp Builder is built with [ArcGIS API for JavaScript](https://developers.arcgis.com/en/javascript/) and [Dojo](http://www.dojotoolkit.org). It allows you to customize and extend functionalities by creating your own widgets and themes.


## Understanding widgets, panels and themes##
### Widget ###
An ArcGIS WebApp Builder widget is a set of text files that you can share, move, and deploy to an ArcGIS WebApp Builder application.  

![Widget structure](../images/Widget-model.jpg?raw=true)

A widget can be a single JavaScript file, which is an AMD module, or can be as complicated as an AMD package, such as a Dojo package. The above screen capture represents a widget that has a template, configuration file, style file, and internationalization support.

Typically, a widget encapsulates a set of isolated and focused business logics in which users can conduct a task. A widget is not only visually interactive with the user, but can also connect to server side resources such as map services from ArcGIS Server or ArcGIS Online. 

An ArcGIS WebApp Builder widget must extend the `BaseWidget` class (BaseWidget.js). By extending the `BaseWidget` class, a new JavaScript class is recognized by the ArcGIS WebApp Builder's `WidgetManager` as a deployable widget. 

For more details, see the walkthrough for developing a widget.  


### Panel ###
A panel is a UI element that displays the widget’s content. Multiple widgets can display in one panel.

By using panel, the widget developer does not have to deal with how the widget and its content (data) displays in the HTML viewer. However, the widget developer can choose to not utilize the provided panel (for more details, see the Widget Development section). For example, the Scalebar widget has its own unique UI.

You can modify or create new panels to obtain new functionality, such as making the widget display movable by dragging, and so on.

### Theme ###
A theme defines the UI of the web app created by ArcGIS WebApp Builder. Themes define:

- How the widget displays via theme panels
- The color scheme, fonts, and so on via styles
- Where widgets are located on the viewer’s UI, via one or more configuration files


## Skill and software needed for ArcGIS WebApp Builder developers ##
Developers need sufficient knowledge and experience using HTML and JavaScript to develop web applications.

[Dojo](http://www.dojotoolkit.org) is the base platform for [ArcGIS API for JavaScript] (https://developers.arcgis.com/en/javascript/) and ArcGIS WebApp Builder. 

To develop a widget for ArcGIS WebApp Builder, a level of familiarity with the ArcGIS JavaScript API is recommended, or at least familiarity with the samples provided by Esri.

Although the required software is a basic text editor, a standards-compliant web browser, and an Internet connection, the following are recommended for efficient development:

- Sublime or Aptana Studio IDE
- Chrome (latest version)
- Firefox (latest version) with the Firebug plug-in



Resources
---------
* [ArcGIS API for JavaScript](http://help.arcgis.com/en/webapi/javascript/arcgis/index.html)
* [ArcGIS Blogs](http://blogs.esri.com/esri/arcgis/)
* [twitter@esri](http://twitter.com/esri)
