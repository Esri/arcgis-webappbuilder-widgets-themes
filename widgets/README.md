
Put custom widgets here. Each widget is a folder which contains all necessary widget elements.

***

Widget is described by a manifest file, which is called manifest.json and is put under widget's root folder. This is the description of the file:


Attribute | Type | Description | Required | Default 
----------|------|-------------|----------|----------
name      | String | The name identifies the widget. The name should be the same as the folder name under the widgets folder. | Y | N/A 
2D        | Boolean| Determines if the widget supports 2D.  | N | True 
3D        | Boolean| Determines if the widget supports 3D.  | N | True
platform  | String | Should be HTML.                        | Y | N/A 
version   | String | The widget version                     | Y | N/A 
wabVersion| String | The WAB version that the widget depends on. | Y | N/A 
author    | String | N/A                                    | N | N/A 
description| String | N/A                                   | N | N/A 
copyright | String | N/A                                    | N | N/A 
license   | String | N/A                                    | N | N/A 
properties| Object | See the following Properties table.    | N | N/A

Properties table for widgets:

Attribute | Type | Description | Required | Default
----------|------|-------------|----------|---------
inPanel         |Boolean       | The widget displays in a panel by default. The developer can change this behavior. If it's not in a panel, the widget displays directly.            | No | true 
hasLocale       | Boolean | The framework loads the i18n files by convention.   | No | true 
hasStyle        | Boolean | The framework loads the style files by convention.  | No | true 
hasConfig       | Boolean | The framework loads the config files by convention. | No | true 
hasUIFile       | Boolean | The framework loads the UI template files by convention. | No | true 
hasSettingPage  | Boolean | The framework loads the setting files by convention. | No | true 
hasSettingUIFile| Boolean | The framework loads the setting UI files by convention. | No | true 
hasSettingLocale| Boolean | The framework loads the setting i18n files by convention. | No | true 
hasSettingStyle | Boolean | The framework loads the setting style files by convention. | No | true 
isController    | Boolean | If the widget is a controller widget, set this property to true. | No | false |
keepConfigAfterMapSwitched | Boolean | This property is used in the builder. If false, builder will clear the widget’s config data after the map is changed. | No | true 
hasVersionManager | Boolean | Whether the widget has VerionManager.js or not. | No | false 
