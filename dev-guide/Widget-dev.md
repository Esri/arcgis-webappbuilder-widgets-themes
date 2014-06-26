# Widget development #
To develop a widget, create a new  `BaseWidget` subclass in the widget folder. The following demonstrates how to create a custom widget from scratch. The screen captures shown below are from Sublime text in which the Web AppBuilder for ArcGIS directory opens.

All of the code for demo widgets are in the stemapp/widgets/samplewidgets/Demo folder. You can view demo widgets through http://**your host**/webapp/?config=sample-configs/config-demo.json.

## Widget naming convention ##
Although a widget’s resources can be named differently, the following are recommended:

- **Widget class**- Uses the convention name, `Widget.js`.
- **Widget template (widget UI)**- Use the same name as the widget class except with a .html extension. For example, `Widget.html`.
- **Widget Configuration File**- Use the `config.json` file and put it into the widget folder.
- **Widget I18N File (locale file)**- Use the `strings.js` file and put it into the nls folder. For more information, see Dojo’s documentation at [http://dojotoolkit.org/documentation/tutorials/1.8/i18n/](http://dojotoolkit.org/documentation/tutorials/1.8/i18n/).
- **Widget style file**- Use the `style.css` file and put it into the css folder. Put all of the images used by the style into the css subfolder, called images.
- **Widget icon files**- Use the `icon.png` file name and put it into the images folder.
- **Widget manifest file**- Use the name `manifest.json` to describe the widget's content.

## Does your widget need a panel? ##

For more information on what a panel is, see the [Theme Development](#theme-development) section for more details.

Two types of widgets are supported. One is a widget without a panel (such as Scalebar widget, Overview widget, and so on) and another is an**in panel** widget. Therefore, you make a decision, before coding, about whether your widget needs a panel or not. There are some differences between them:    

* Widget without a panel is not allowed in a widget pool. It’s only available in preload widgets.
* If a widget is without a panel, the app container opens the widget when the app starts.
* If a widget is in a panel, the app container creates an action button identified by the widget icon. When the widget icon is clicked, the widget opens in the panel.

You can set the `inPanel` property in the widget's `manifest.json`. For more details, see [Package your widget](#package-your-widget).

## Create the files for the widget ##
A widget at a minimum requires one file, the JavaScript file that defines it. However, for a more full-featured widget, there are multiple files to define it, including the HTML template, i18n support, styles, and so on. All of these will be demonstrated.

First, to keep your widget files, create a folder (samplewidgets/Demo). Next, create the following set of folders and files in the folder:

![demo widget folder](images/demo-wiget-folder.png?raw=true)

- The JavaScript file that defines the widget (Widget.js).
- Template file that defines the widget’s UI (Widget.html)
- The widget’s Configuration file (config.json).
- The widget’s i18n strings file (nls/strings.js).
- The widget’s style file (css/style.css).

## Extend the BaseWidget class ##
JavaScript is not a classical language. It is a prototypical object oriented language. As such, to make most developers comfortable with developing widgets, the Web AppBuilder for ArcGIS uses Dojo’s functions to create and extend classes. The Web AppBuilder for ArcGIS defines the `BaseWidget` class from which you create the child class, `Widget`.

Open Widget.js in a text editor. The basic code for extending `BaseWidget` is:

```
define(['dojo/_base/declare', 'jimu/BaseWidget'],
function(declare, BaseWidget) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    // DemoWidget code goes here 
    
  });
});
```

This code:

- Declares the `DemoWidget` class as a child class of `BaseWidget`.

For more information, see [http://dojotoolkit.org/documentation/tutorials/1.8/declare/](http://dojotoolkit.org/documentation/tutorials/1.8/declare/).

## Set the required properties ##

The following properties are required by the programming model:

- **baseClass**- The widget’s root element CSS class name. Use the name, jimu-widget-widgetname.

The code looks like the following:

```
define(['dojo/_base/declare', 'jimu/BaseWidget'],
function(declare, BaseWidget) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {
    // DemoWidget code goes here 
    baseClass: 'jimu-widget-demo'
  });
});

```


## Define the widget’s template (UI) ##

Web AppBuilder for ArcGIS widgets have an HTML template. This template defines the widget’s UI.  
	
Open the Widget.html file in a text editor. Replace it with this:

```
<div>
	<div>I am a demo widget.</div>
</div>
```

At this point, test your widget. Open config-demo.json (in stemapp/sample-configs folder). Find widgetPool->widgets, and add a new widget element like this:

```
{
  "label": "demo",
  "uri": "widgets/samplewidgets/Demo/Widget"
}

```
Start the Web AppBuilder for ArcGIS through *http://**you host**/webapp/?config=sample-configs/config-demo.json* ,and click the icon. The widget appears like the following:

![demo widget UI](images/demo-wiget-ui.png?raw=true)

**Note**  
By default, the widget's template does not support dijit in the template. If you need to use dijit in the template, add `dijit/_WidgetsInTemplateMixin` into your required list, and mixin this class into your widget. Meanwhile, ensure that you have required all of the dijits used in the template. For more information, see [Creating Template-based Widgets](http://dojotoolkit.org/documentation/tutorials/1.9/templated/)

## Make it configurable ##

Currently, there are no configuration options for the Demo widget.

To change that, open config.json in the widget folder in a text editor. Add some JSON-structured text so that you can pass the config to your widget:

```
{
	"configText":"abcdefg"
}

```

Alter the HTML template to use the config that you have read from your config file.

```
<div>
	<div>I am a demo widget.</div>
	<div>This is configurable.[${ config.configText}]</div>
</div>

```

Now, the Demo widget looks like the following:

![configured demo widget](images/demo-wiget-ui-configured.png?raw=true)

The ${configData.configText} marker in the template is automatically substituted with the values in the config.json file.

## Add i18n support ##

Currently, in the Demo widget, there are some hard-coded English language strings:

- I am a demo widget.
- This is configurable.

To internationalize the UI, generally you should isolate these strings in a separate language-specific resource file and reference the strings by their identity. Dojo provides complete i18n support, which is sensitive to user settings in the browser. For example, if Chinese translation is defined, and a user visits your web application with their browser language code set to zh-cn, they should automatically get the Chinese UI. For more information, see [http://dojotoolkit.org/documentation/tutorials/1.8/i18n/](http://dojotoolkit.org/documentation/tutorials/1.8/i18n/).

The first step is to abstract the user interface strings to the default resource file. The user determines the translation of these strings. 

Open the nls/strings.js file with a text editor. Add the following:

```
define({
    root:{
        label1: "I am a demo widget.”
        label2: "This is configurable."
    },
    "zh-cn": true    
});

```

Create a folder named zh-cn and create a strings.js file in it. The following is the content:

```
define({
    label1 : "我是一个演示widget。",
    label2 : "这里可以配置。"
});

```

Apply the changes to the template by removing the hard-coded English language and replacing it with markers:

```
<div>
	<div>${nls.label1}.</div>
	<div>${nls.label2}.[${configData.configText}]</div>
</div>

```

Reload your Web AppBuilder for ArcGIS application. This time, add a URL parameter, `locale=zh-cn`, or you change the browser’s locale configuration to view the change. 

![localized](../images/demo-wiget-ui-localized.png?raw=true)

To support specific languages, create folders under the nls/ folder, named by the language code (for example, en, fr, ru). Copy the strings.js file to that folder and update the content to reflect the language for that code.

## Make it user friendly ##

On the HTML page, a CSS file is used to layout the page, making it user friendly. The recommended way is to use a separate style file to write the CSS rules. Put the widget CSS in the css/style.css file.

Open the css/style.css file and add the following code:

```
.jimu-widget-demo div:first-child{
  color: red;
}

```
Note that all of the selectors in the style.css file should contain the base CSS class to avoid name conflict.

Open the viewer. The widget resembles the following:

![demo widget](images/demo-wiget-final.png?raw=true)

## Let the widget fit the theme ##

For more information about themes, see the [Theme Development](#theme-development) session.  
By default, all of the CSS rules you write are applied in all themes. If you want to apply some CSS rules for a specific theme or theme style, write your CSS rule like this:
```
.themeName .styleName {your selector}{  
}

```

## Access a map ##

The Web AppBuilder for ArcGIS is a map-centric application. It provides map property defined in the `BaseWidget` class to access the map. You can access the map property through `this.map`. . The widget’s map property is a type of `esri.Map` from ArcGIS JavaScript API, configured in the config.json file. You can access all the map features provided by ArcGIS JavaScript API. Code the widget just like writing a regular ArcGIS JavaScript application.

When a widget is instantiated, the map passes into it. As a result, you can access a map property in the `postCreate` or `startup` methods.

Modify the UI template and add a div tag to display the map id property:

```
<div>
	<div>${nls.label1}.</div>
	<div>${nls.label2}.[${configData.configText}]</div>
      <div data-dojo-attach-point="mapIdNode"></div>
</div>

```
Add JavaScript code to access map:

```
startup: function(){
  this.inherited(arguments);
  this.mapIdNode.innerHTML = 'map id:' + this.map.id;
}

```

## Communication to the app container ##

**Response to the app container**

The widget is a dojo dijit; therefore, when a widget is instantiated, it goes through the full life cycle of a dijit, such as `constructor`, `postCreate`, `startup` and so on. For more information, see  [http://dojotoolkit.org/documentation/tutorials/1.9/understanding_widgetbase/](http://dojotoolkit.org/documentation/tutorials/1.9/understanding_widgetbase/)

In addition to the dojo dijit’s life cycle functions, the widget has other callback functions that you can use:

`onOpen`- Called each time the widget opens. When a widget is instantiated, this method is called after startup.

`onMaximized`- Called when the widget is maximized. This method may never be called in some panels that do not have a maximize/minimize state.

`onMinimized`- Called when the widget is minimized. This method may never be called in some panels that do not have a maximize/minimize state.

`onClose`- Called when the widget closes.

`onSignIn`- Called when a user signs in to the portal/AGOL.

`onSignOut`- Called when a user signs out from the portal/AGOL.

`onPositionChange`- Called when widget’s position (left, right, top, bottom, width, height) changes. The widget’s position may be changed when the user changes the layout in the builder.

`resize`- Called when the window resizes.

## Widget properties ##

TThe following are additional properties to use in widgets:

<table>
<tr>
<th>Name </th>
<th>Description </th>
</tr>
<tr>
<td>id</td>	
<td>The unique ID of the widget set in the config.json file or generated by the app container.</td>
</tr>
<tr>
<td>label</td>	
<td>Set in the config.json file</td>
</tr>
<tr>
<td>icon</td>	
<td>The widget’s icon URL</td>
</tr>
<tr>
<td>config</td>	
<td>The widget’s config object</td>
</tr>
<tr>
<td>map</td>	
<td>The map this widget works to</td>
</tr>
<tr>
<td>appConfig</td>	
<td>The app's main config.json file is stored here.</td>
</tr>
<tr>
<td>folderUrl</td>	
<td>The widget folder’s URL.</td>
</tr>
<tr>
<td>state</td>	
<td>The widget’s current state, that is, opened or closed.</td>
</tr>
<tr>
<td>windowState</td>  
<td>The widget’s current window state, that is, normal, maximized, or minimized.</td>
</tr>
</table>

## Use the app container CSS classes and dijits ##


To implement a consistence UI style and make development work easier, the widget developer should use the CSS classes and dijits provided by the app container.

You can view these components from http://**you host**/webapp/jimu.js/tests/test-dijit.html* and *http://**you host**/webapp/jimu.js/tests/test-css.html. Note that these CSS classes and dijits will be added and updated as the app container evolves.

The CSS classes can be found in jimu.js/css/jimu.css.

<table>	
<tr>
<th>Name</th>
<th>Description</th>
</tr>
<tr>
<td>jimu-input</td>	
<td>Styled input tag</td>
</tr>
<tr>
<td>jimu-btn</td>	
<td>Styled button using div</td>
</tr>
<tr>
<td>Jimu-icon-btn</td>	
<td>Button with an icon in the center</td>
</tr>
<tr>
<td>Jimu-nav-bar</td>	
<td>Group of icon buttons</td>
</tr>
<tr>
<td>jimu-oe-row</td>	
<td>Odd even row</td>
</tr>
</table>	
<br>
The dijits: (can be found in jimu.js/dijit)

<table>
<tr>
<th>Name</th>	
<th>Description</th>
</tr>
<tr>
<td>CheckBox</td>	
<td>N/A</td>
</tr>
<tr>
<td>RadioBtn</td>	
<td>N/A</td>
</tr>
<tr>
<td>DrawBox</td>
<td>N/A</td>	
</tr>
<tr>
<td>ColorPicker</td>	
<td>N/A</td>
</tr>
<tr>
<td>Popup</td>	
<td>N/A</td>
</tr>
<tr>
<td>ImageChooser</td>	
<td>N/A</td>
</tr>
<tr>
<td>TabContainer</td>	
<td>N/A</td>
</tr>
<tr>
<td>ExtentChooser</td> 
<td>N/A</td>
</tr>
<tr>
<td>Message</td> 
<td>N/A</td>
</tr><tr>
<td>LayerFieldChooser</td> 
<td>N/A</td>
</tr><tr>
<td>PopupConfig</td> 
<td>N/A</td>
</tr><tr>
<td>SymbolChooser</td> 
<td>N/A</td>
</tr>
</table>

## Make the widget responsive ##

The jimu.js file does not only support a responsive UI layout but also provides functions for developers to develop responsive widgets. 

There are two ways to archive the responsive goal: CSS and layout dijit .

The CSS classes can be found in jimu.js/css/jimu.css.

<table>
<tr>
<th>Name</th>	
<th>Description</th>
</tr>
<tr>
<td>jimu-r-row</td>	
<td>One row of the layout</td>
</tr>
<tr>
<td>col-1-2</td>	
<td>The width is half of its parent</td>
</tr>
<tr>
<td>col-1-3</td>	
<td>The width is one third of its parent</td>
</tr>
<tr>
<td>col-2-3</td>	
<td>N/A</td>
</tr>
<tr>
<td>col-1-4</td>	
<td>N/A</td>
</tr>
<tr>
<td>col-3-4</td>	
<td>N/A</td>
</tr>
</table>
<br>
The dijits can be found in jimu.js/dijit

<table>
<tr>
<th>Name</th>	
<th>Description</th>
</tr>
<tr>
<td>TileLayoutContainer</td>	
<td>N/A</td>
</tr>
</table>
<br>	

If both of them cannot meet your requirements, follow the responsive UI best practices.

## Communication between widgets ##

As the requirement of reading or sending data between widgets is common, the `BaseWidget` class supports this programming model.

In the constructor of the `BaseWidget` class, it subscribes the `publishData`, `dataFetched`, and `noData` events. Meanwhile, the `BaseWidget` class provides the `publishData` and `fetchData` methods.

If you want the widget to publish data, call the `publishData` method. If you want the widget to receive data from another widget, call the `fetchData` method, and write code to override the `onData` and `onNoData` methods to read data.

## Use the dojo dijit in widget ##

The widget is a dojo dijit, which derives from the BaseWidget dijit; therefore, you can use the existing dijit as normal. With performance considerations, don’t mixin the `_WidgetsInTemplateMixin` in the BaseWidget. If you need to use dijit in the widget’s UI template file, mixin this class and require all of the dijits that you use in the template file. For more information, see [Creating Template-based Widgets](http://dojotoolkit.org/documentation/tutorials/1.9/templated/) for more information.


## Make the widget configurable in the builder ##

If the widget is configurable, the user can change the widget’s behavior by editing the config.json file. For a better user experience, the widget should provide a config UI to config itself when it is configured in the builder.

These are the conventions the widget should follow:

1. Create a folder named setting to hold all of the setting related files.
1. Create a Setting.js file in the setting folder to hold the config logic. This class should inherit from `BaseSetting` class. In this class, there is a config property that holds the widget config data.
1. Also, this class should override two methods: `getConfig`, return the config data input by the user and `setConfig` to initialize the widget setting page depending on the widget config data.
1. Create a Setting.html file in the setting folder to hold the config UI
1. Create a strings.js file in the setting /nls folder if the config needs to support internalization.
1. Create a style.css file in the setting /css folder to hold the css property.

During development, you can use http://**your host**/webappbuilder/?appid=stemapp to directly access your widget.


## Package your widget ##

The widget is easily packaged and shared. As a result, all of the widget contents are placed in the widget folder with a description file named, manifest.json, which is a JSON object and contains following properties:

<table>
<tr>
<th>Attribute</th>	
<th>Type</th>	
<th>Description</th>	
<th>Required</th>	
<th>Default</th>
</tr>
<tr>
<td>name</td> 
<td>String</td> 
<td>The name identifies the widget. The name should be the same as the folder name under the widgets folder.</td>  
<td>Y</td>  
<td>N/A</td>
</tr>
<tr>
<td>2D</td>	
<td>Boolean</td>	
<td>Determines if the widget supports 2D</td>	
<td>N</td>	
<td>True</td>
</tr>
<tr>
<td>3D</td>	
<td>Boolean</td>	
<td>Determines if the widget supports 3D.</td>	
<td>N</td>	
<td>False</td>
</tr>
<tr>
<td>platform</td>	
<td>String</td>	
<td>Should be HTML.</td>	
<td>Y</td>	
<td>N/A</td>
</tr>
<tr>
<td>version</td>	
<td>String</td>	
<td>The format is 0.0.1.</td>	
<td>Y</td>	
<td>N/A</td>
</tr>
<tr>
<td>author</td>	
<td>String</td>
<td>N/A</td>		
<td>N</td>	
<td>N/A</td>
</tr>
<tr>
<td>description</td>	
<td>String</td>	
<td>N/A</td>	
<td>N</td>	
<td>N/A</td>
</tr>
<tr>
<td>copyright</td>	
<td>String</td>
<td>N/A</td>
<td>N</td>	
<td>N/A</td>
</tr>
<tr>
<td>license</td>	
<td>String</td>	
<td>N/A</td>	
<td>N</td>	
<td>N/A</td>
</tr>
<tr>
<td>properties</td>  
<td>Object</td> 
<td>See the following Properties table.</td> 
<td>N</td>  
<td>N/A</td>
</tr>
<tr>
</table>
<br>
Properties table for widgets:

<table>
<tr>
<th>Attribute</th>  
<th>Type</th> 
<th>Description</th>  
<th>Required</th> 
<th>Default</th>
</tr>
<tr>
<td>inPanel</td> 
<td>Boolean</td> 
<td>The widget displays in a panel by default. The developer can change this behavior. If it's not in a panel, the widget displays directly.</td>  
<td>N</td>  
<td>true</td>
</tr>
<tr>
<td>hasLocale</td> 
<td>Boolean</td> 
<td>The framework loads the i18n files by convention.</td>  
<td>N</td>  
<td>true</td>
</tr>
<tr>
<td>hasStyle</td> 
<td>Boolean</td> 
<td>N/A</td>  
<td>N</td>  
<td>true</td>
</tr>
<tr>
<td>hasConfig</td> 
<td>Boolean</td> 
<td>N/A</td>  
<td>N</td>  
<td>true</td>
</tr>
<tr>
<td>hasUIFile</td> 
<td>Boolean</td> 
<td>N/A</td>  
<td>N</td>  
<td>true</td>
</tr>
<tr>
<td>hasSettingPage</td> 
<td>Boolean</td> 
<td>N/A</td>  
<td>N</td>  
<td>true</td>
</tr>
<tr>
<td>hasSettingUIFile</td> 
<td>Boolean</td> 
<td>N/A</td>  
<td>N</td>  
<td>true</td>
</tr>
<tr>
<td>hasSettingLocale</td> 
<td>Boolean</td> 
<td>N/A</td>  
<td>N</td>  
<td>true</td>
</tr>
<tr>
<td>hasSettingStyle</td> 
<td>Boolean</td> 
<td>N/A</td>  
<td>N</td>  
<td>true</td>
</tr>
<tr>
<td>isController</td> 
<td>Boolean</td> 
<td>If the widget is a controller widget, set this property to true.</td>  
<td>N</td>  
<td>false</td>
</tr>
</table>
<br>
After this file is complete, can zip the widget and share the package to the widget repository.

