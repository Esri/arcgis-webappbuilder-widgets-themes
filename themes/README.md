This folder contains themes that shared by the community. If you would like to share your themes to the community, please check in them here.  

## How to add themes into Web AppBuilder
To add themes into the builder, follow these steps:

1. Open manifest.json file in theme folder. 
2. Modify the properties accordingly.
3. Save the file.
4. Copy the theme folder and paste it in the themes repository. By default, the theme repository is located under \client\stemapp\themes folder. In this way, your theme is available to the builder. 

## The theme manifest file
Theme is described by a manifest file, which is called manifest.json and is put under theme's root folder. This is an example of the file:

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
  "license": "http://www.apache.org/licenses/LICENSE-2.0",
  "wabVersion": "1.1"
}
```
