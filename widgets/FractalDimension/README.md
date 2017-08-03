# Fractal Dimension
This widget uses a box-counting method to measure the approximate 
fractal dimension of a polygon feature in a Feature Layer.

Some background on fractal dimension and its use in GIS analysis:

  - [Fractal Dimension on Wikipedia](https://en.wikipedia.org/wiki/Fractal_dimension)
  - [*Perspectives Of Fractal Geometry In GIS Analyses*](http://gisak.vsb.cz/GIS_Ostrava/GIS_Ova_2011/sbornik/papers/Paszto.pdf)

This widget uses the extent of the feature as the initial box. This
 is the method recommended by [*Box-Counting Dimension of Fractal 
 Urban Form: Stability Issues and Measurement Design*](https://www.researchgate.net/publication/262392407_Box-Counting_Dimension_of_Fractal_Urban_Form_Stability_Issues_and_Measurement_Design)
in section 3.2.1 (page 47). 

### Version History

  - 1.0: Works with polygon features, including multi-part polygons and polygons with holes.
  
### License Summary
Copyright 2017 by Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.