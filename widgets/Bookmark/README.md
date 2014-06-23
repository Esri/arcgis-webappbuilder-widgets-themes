## Bookmark ##
### Overview ###
The Bookmark widget applies for both 2D and 3D maps. For 2D maps, it stores a collection of map view extents. For 3D maps, it stores a collection of camera. It also enables end users to add and delete their own bookmarks. Web map bookmarks are automatically used if available.

### Attributes ###
* `bookmarks2D`: Object[]; default: no default —The 2D map bookmarks.
    -  `*name`: String; default: no default —The bookmark name.
    -  `*extent`: Object; default: no default; the map extent —The object is the same as the object returned by Extent.toJson() method in JS API. See [Extent](https://developers.arcgis.com/javascript/jsapi/extent-amd.html) to get more details.
    -  `*thumbnail`: String; default: images/thumbnail_default.png. As a recommendation, put all images in the images folder.
 
* `bookmarks3D`: Object[]; default: no default; The 3D map bookmarks.
    -  `*name`:  String; default: no default —The bookmark name.
    -  `*camera`: Number[]; default: no default —The camera is an array with the length of 5 or 6. The first fifth of the array is x, y, z, heading, tilt, and the sixth is the WKID. The sixth is optional, if not set, the default WKID is 4326.
    -  `*thumbnail`: String; default: “images/thumbnail_default.png”. As a recommendation, put all of the images under in the images folder.
 
