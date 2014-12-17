Put custom themes here. Each theme is a folder which contains all necessary theme elements.
-------------------------------------
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
