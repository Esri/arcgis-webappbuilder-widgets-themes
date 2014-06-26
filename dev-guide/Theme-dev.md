# Theme development #

##  Concepts ##

A theme defines panels, styles, and layouts. One app can include more than one theme, but can only use one theme while running. 

A theme is a folder named as the theme name. It contains the following files:

* Similar with a widget, a theme must have an icon file named icon.png, which is under the images folder.  

* A common.css file under the theme folder. It contains style content that is common for all styles.

* A theme can include multiple styles in the styles folder. Each style is a folder that named as the style name. Each style must have a style.css file. A style named default is necessary.

* A theme can include multiple panels in the panels folder. Each panel is a folder named as the panel name. Each panel must have a Panel.js file.

* •	A theme can include multiple layouts in the layouts folder. Each layout is a folder named as the layout name. Each layout must have a config.json file and an icon.png file. A layout named default is necessary.

* A manifest.json file to describe the theme content. The followings are its properties:

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
<td>The theme’s identity. It must be the same as the theme folder name.</td>  
<td>Y</td>  
<td>N/A</td>
</tr>
<tr>
<td>label</td> 
<td>String</td> 
<td>The displayed text for the theme.</td>  
<td>Y</td>  
<td>Theme's name</td>
</tr>
<tr>
<td>styles</td> 
<td>[]</td> 
<td>A list of theme styles. Each style has a name, description, and styleColor properties.</td>  
<td>Y</td>  
<td>N/A</td>
</tr>
<tr>
<td>panels</td> 
<td>[]</td> 
<td>A list of theme panels. Each panel has a name and description properties.</td>  
<td>Y</td>  
<td>N/A</td>
</tr>
<tr>
<td>layouts</td> 
<td>[]</td> 
<td>A list of theme layouts. Each layout has a name and description properties. A layout is a configuration template file, which contains some widget configurations but leaves the uri property empty.</td>  
<td>Y</td>  
<td>N/A</td>
</tr>
<tr>
<td>version</td>  
<td>String</td> 
<td>The version format is 0.0.1.</td> 
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
</table>
<br>
ArcGIS WebApp Builder provides two out-of-box themes, FoldableTheme and TabTheme. You can develop custom themes if these themes do not meet your requirements.

## Create a Demo theme ##
In the created Demo theme, there is one panel, two styles, and two layouts. The panel is called `SimpleBorderPanel`, and has a basic border. One style, called `default`, has red as a main color, and another called `black`, has black as a main color. One layout called `default`, places one widget on the left side, and is the other called `right`, places one widget on the right side.

Notes:

* The source code of the Demo theme is placed under `stemapp/themes/DemoTheme` in our source code repository. You can try the Demo theme in the builder.
* If you create a custom theme, put your theme folder under the theme repository folder (`stemapp/themes` by default).

### Create files for the theme ###
As described above, to create a theme, you need to create some necessary files under the theme folder. Here is the file structure of the Demo theme:

![DemoTheme](../images/demo-theme.png?raw=true)

### Edit the manifest.json ###
The manifest.json file describes the theme’s content, and the builder reads this file to get the theme’s content. Based on the specification described above, update the manifest.json file as follows:
```
{
  "name": "DemoTheme",
  "panels": [
    {
      "name": "SimpleBorderPanel",
      "description": "This is a panel with a border"
    }
  ],
  "styles": [
    {
      "name": "default",
      "description": "this is default style",
      "styleColor": "red"
    },
    {
      "name": "black",
      "description": "this is black style",
      "styleColor": "#000000"
    }
  ],
  "layouts": [
    {
      "name": "default",
      "description": "this is the left layout"
    },
    {
      "name": "right",
      "description": "this is the right layout"
    }
  ],
  "version": "0.0.1",
  "author": "Esri R&D Center Beijing",
  "description": "",
  "copyright": "",
  "license": "http://www.apache.org/licenses/LICENSE-2.0"
}

```

### Create the panel ###
A panel is a UI element that used to display the widget’s content. Multiple widgets can use the same panel. However, the widget does not display directly on the panel. It is put in the WidgetFrame, then the widget frame displays on the panel. One widget frame holds one widget, and one panel can contain more than one widget frame. The following image gives you a general picture about the relationships of the panel, widget frame, and widget.

![Panel](../images/panel-structure.png)  

Developing a panel is the hardest work for a custom theme. To create a panel, you need JavaScript, CSS, and HTML knowledge. It is also beneficial to understand the dojo’s layout knowledge.

To create a panel, create a class that derives from `BaseWidgetPanel`. If the default widget frame meets your requirements, create a frame class that derives from `BaseWidgetFrame`.

You can override some functions when you create your panel:

* `createFrame`- This function returns the widget frame object.
* `reloadWidget`- This function is called by the builder when the widget is modified.

The meaning of the following functions is the same as widget:

* `onOpen`
* `onClose`
* `onMaximize`
* `onMinimize`
* `onNormalize`

#### Create SimpleBorderPanel ####
Because the SimpleBorderPanel is very basic, extend the `BaseWidgetPanel` without adding any new features. See the following code:
```
define(['dojo/_base/declare',
  'jimu/BaseWidgetPanel'
],
function(declare, BaseWidgetPanel) {
  return declare([BaseWidgetPanel], {
    baseClass: 'jimu-widget-panel jimu-border-panel',
  });
});
```
For more information about panels, see `BaseWidgetPanel`.

### Create the styles ###
You need to write some style (CSS) files to make the theme more beautiful. In the style files, you can override the styles in `jimu.css`, and write the styles that your panel needs as well. Place the common styles (used by all of the styles) in the `common.css` file, and the specific styles in the corresponding `style.css` files.

There should be a style named `default`, to use when the theme is selected in the builder.

#### Edit teh default style ####
Because the default style’s main color is red, use the following style:
```
.jimu-border-panel{
  border: 1px solid red;
}
```
#### Edit the black style ####
```
.jimu-border-panel{
  border: 1px solid black;
}
```

### Create the layouts ###
A layout is a config template file, which contains some widget config properties but leaves the `uri` property empty. When the app’s layout is changed, the builder does the following:

 * For preload widgets, use the panel and position properties in the new layout to replace the panel, and position properties in the old layout by order. If the widget count is not the same, ignore the rest.
 * For a widget pool, replace the group’s panel property by order.
 * For a map, replace the position property.

There should be a layout named `default`. This layout is used when the theme is selected in the builder to create the app config object.

#### Edit default layout ####
```
{
  "preloadWidgets": {
    "panel": {
      "uri": "themes/DemoTheme/panels/SimpleBorderPanel/Panel"
    },
    "widgets": [{
      "label": "Scalebar",
      "uri": "widgets/Scalebar/Widget",
      "position": {
        "left": 25,
        "bottom": 25
      }
    }, {
      "label": "Coordinate",
      "uri": "widgets/Coordinate/Widget",
      "inPanel": false,
      "position": {
        "left": 200,
        "bottom": 10
      }
    }, {
      "label": "Select a basemap",
      "uri": "widgets/BasemapGallery/Widget",
      "inPanel": true,
      "position": {
        "left": 45,
        "top": 5,
        "width": 430,
        "height": 520
      }
    }, {
      "position": {
        "left": 95,
        "top": 5,
        "width": 400,
        "height": 410
      }
    }]
  },

  "map": {
    "position": {
      "left": 0,
      "top": 0,
      "right": 0,
      "bottom": 0
    }
  }
}
```

#### Edit right layout ####
```
{
  "preloadWidgets": {
    "panel": {
      "uri": "themes/DemoTheme/panels/SimpleBorderPanel/Panel"
    },
    "widgets": [{
      "label": "Scalebar",
      "uri": "widgets/Scalebar/Widget",
      "position": {
        "left": 25,
        "bottom": 25
      }
    }, {
      "label": "Coordinate",
      "uri": "widgets/Coordinate/Widget",
      "inPanel": false,
      "position": {
        "left": 200,
        "bottom": 10
      }
    }, {
      "label": "Select a basemap",
      "uri": "widgets/BasemapGallery/Widget",
      "inPanel": true,
      "position": {
        "left": 45,
        "top": 5,
        "width": 430,
        "height": 520
      }
    }, {
      "position": {
        "right": 95,
        "top": 5,
        "width": 400,
        "height": 410
      }
    }]
  }
}
```
### Try the Demo theme in the builder ###

Start the builder and create a new app. If no errors occur, the Demo theme shows in the Themes tab.

1. Click the Demo theme.
2. Click the Layout icon to switch layouts.
3. Open the BasemapGallery widget.
4. Click the style icon to switch styles.

During development, use http://**your host**/webappbuilder/?appid=stemapp to access your theme directly.
