# Theme development #

##  Concepts ##

An ArcGIS Web AppBuilder theme is a collection of user interface elements that defines an app's look-and-feel, layout, app navigation and on screen functional UI items such as scale bar, overview map, etc. By developing a theme, you can create your own application interface, interfactive user experience and branding style.

The theme elements includes widget panels, style sheets, and layout definitions and theme widgets. One app can include more than one theme, but can only use one theme while running. 

The following are the UI element definition:

<table>
<tr><th>Theme Element</th><th>Definition</th></tr>
<tr>
<td>Panel</td>
<td>A Panel is an UI window that displays widget's content. A panel can be developed to have its own distinguish behaviors and style for a specific theme. For example, you can develop a panel that can be dragged around the screen and have purple color style that matches your overall theme style. <br><br>
With the theme panel, widget developers can focusing on developing a widget's function and content without worry about how the widget will be displayed, which further simplys the widget development task.<br><br>
A theme can contain multiple panels.</td>
</tr>
<tr>
<td>Theme Widget</td>
<td>A theme widget is no more than a regular Web AppBuilder widget in terms of coding. However, without such widget as part of the theme, the theme is not complete. For example, the Header Controller widget is part of the out-of-box theme, called Foldable theme. Header Controller is developed to navigate all the widgets configured into an app.<br><br>
Creating the Theme Widget is also a mechanism to ensure a theme can be shared as whole. 
</td>
</tr>
<tr>
<td>Style</td>
<td>A theme style is a CSS stylesheet that defines the theme's color scheme. A theme can have multiple styles that each one has a style name.</td>
</tr>
<tr>
<td>Layout</td>
<td>A theme layout is essentially an app configuration that places all the UI elements (widgets) on the screen. It also includes predefined position holders on the screen where can be configured with widgets during the configuration process using the GUI AppBuilder. A theme can have multiple layouts.</td>
</tr>
</table>

##Theme Development Convention##

There are conventions to follow when developing a Web AppBuilder theme:
 
* All theme elements are contained inside a folder. The folder name should be as **same** as the theme name.

* Similar to a widget, a theme must have an icon file named `icon.png`, which is under the `\images` folder.  

* the theme root folder contains a `common.css` file. It defines the style content that is common for all styles.

* A theme can include multiple styles in the `\styles` folder. 

* Each style has a folder that named as same as the style name. Each style must have a `style.css` file. 

* There must be a style named `default`.

* A theme can include multiple panels in the `\panels` folder. 

* Each panel has a folder named as same as the panel name. Each panel must have a `Panel.js` file.

* A theme can include multiple layouts in the `\layouts` folder. 

* Each layout has a folder named as same as the layout name. 
*
* Each layout must have a `config.json` file and an `icon.png` file. 

* There must be a layout named `default`.

* There must be a `manifest.json` file to describe the theme content. 

##Theme Manifest File##

the theme manifest file is a very important element for developing a theme, which allows a theme to be used within the GUI AppBuilder and also ensure a standard way of sharing a theme. The followings are the manifest properties:

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
<td>A list of theme styles. Each style has a 'name', 'description', and 'styleColor' properties.<br><br>

The 'styleColor' will be used by the GUI AppBuilder to display the style's color.
</td>  
<td>Y</td>  
<td>N/A</td>
</tr>
<tr>
<td>panels</td> 
<td>[]</td> 
<td>A list of theme panels. Each panel has a 'name' and 'description' properties. The name should be the same as the panly folder.</td>  
<td>Y</td>  
<td>N/A</td>
</tr>
<tr>
<td>widgets</td> 
<td>[]</td> 
<td>A list of theme widgets. It contains 'name' and 'description' properties. The widget name should be the same as the widget folder name.</td>  
<td>Y</td>  
<td>N/A</td>
</tr>
<tr>
<td>layouts</td> 
<td>[]</td> 
<td>A list of theme layouts. Each layout has a name and description properties. A layout is a configuration template file, which contains some widget configurations but leaves the uri property empty. The layout name should be the same as the layout foilder inside the \layouts folder</td>  
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
Web AppBuilder for ArcGIS provides two out-of-box themes, FoldableTheme and TabTheme. You can develop custom themes if these themes do not meet your requirements.

## Create a theme ##
There is a Demo theme comes with the Web AppBuilder as an example of how to develop a theme.

The Demo theme has one panel, one widget, two styles, and two layouts. 

* The panel is called `SimpleBorderPanel`, and has a basic border. 
* The style, called `default`, has red as a main color, and another called `black`, has black as a main color. 
* This first layout called `default`, which places one widget on the left side of the screen. Another is called `right`, which places one widget on the right side of the screen.

Notes:

* The source code of the Demo theme is under the folder `stemapp/themes/DemoTheme`. You can try the Demo theme from within the GUI AppBuilder.
* Once create a custom theme, You can put the theme folder under the theme repository folder (`stemapp/themes` by default).

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
  "description": "This theme is for demoing the creation of a theme",
  "copyright": "",
  "license": "http://www.apache.org/licenses/LICENSE-2.0"
}

```

### Create the panel ###
A panel is a UI element that used to display the widget’s content. Multiple widgets can use the same panel. However, the widget does not display directly on the panel. It is put in the WidgetFrame, then the widget frame displays on the panel. One widget frame holds one widget, and one panel can contain more than one widget frame. The following image gives you a general picture about the relationships of the panel, widget frame, and widget.

![Panel](../images/panel-structure.png)  

Developing a panel is as same as developing a web compenent, which requires JavaScript, CSS, and HTML skill and knowledge. It is also beneficial to understand the dojo’s layout concept and practice.

To create a panel, you need create a class that derives from `BaseWidgetPanel`. If the default widget frame meets your requirements, you can create a frame class that derives from `BaseWidgetFrame`.

###Theme Lifecycle Functions###
Just as the widget development, there are lifecycle functions that you can override to interactive with the AppBuilder framework. 

You can override the following functions when you create your panel:

* `createFrame`- This function returns the widget frame object.
* `reloadWidget`- This function is called by the builder when the widget is modified.

The following lifecycle functions is the same as widget's:

* `onOpen`
* `onClose`
* `onMaximize`
* `onMinimize`
* `onNormalize`

#### Create SimpleBorderPanel ####
Since the SimpleBorderPanel is very simple, it can just extend the `BaseWidgetPanel` without adding any new features. See the following code:

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
You need to write some style (CSS) files to make the theme more beautiful and have consistent UI. In the style files, you can override the styles in `jimu.css`, and write the styles that your panel needs as well. Place the common styles (used by all of the styles) in the `common.css` file, and the specific styles in the corresponding `style.css` files.

There should be a style named `default`, which is used by default from within the GUI AppBuilder.

#### Edit the default style ####
The default style’s main color is red, thus use the following style:

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
A layout is a config template file, which contains some widget config properties but leaves the `uri` property empty. 

There are rules have been implemented inside the GUI AppBuilder that apply when swtiching layouts from A to B. The rules are:

 * For on-screen widgets, use the panel and position properties of the layout A to replace the panel, and position properties in the layout B, by order. 
 * If the widget placeholder count is not the same, ignore extra positions.
 * For a widget pool, replace the group’s panel property by order.
 * For a map, replace the position property.

There should be a layout named `default`. This layout is used by default when its theme is selected in the GUI AppBuilder.

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

Once you placed the Demo theme to the `themes` folder, start the AppBuilder and create a new app, the Demo theme shows in the Themes tab.

1. Click the Demo theme.
2. Click the Layout icon to switch layouts.
3. Open the BasemapGallery widget.
4. Click the style icon to switch styles.

During development, use http://**your host**/webappbuilder/?appid=stemapp to access your theme directly.
