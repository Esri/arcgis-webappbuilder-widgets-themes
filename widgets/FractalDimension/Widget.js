/************************************************
 * Copyright 2017 by Esri

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

define([
        'esri/tasks/query',
        'esri/layers/GraphicsLayer',
        'esri/symbols/SimpleFillSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/graphic',
        'esri/geometry/Polygon',
        'esri/geometry/Point',
        'esri/geometry/geometryEngineAsync',
        'esri/Color',
        'dojo/_base/declare',
        'dojo/_base/array',
        'jimu/BaseWidget',
        'dojo/Deferred',
        'dojo/on',
        'dojo/dom',
        'dojo/dom-style',
        'dojo/_base/lang',
        'dojo/dom-construct',
        'dojo/topic',
        "dijit/form/Button",
        "dijit/form/Select",
        "dojox/charting/Chart",
        "dojox/charting/axis2d/Default",
        "dojox/charting/plot2d/Scatter",
        "dojox/charting/plot2d/Lines"
    ],
    function (Query,GraphicsLayer,SimpleFillSymbol,SimpleLineSymbol,Graphic,
              Polygon,Point,geometryEngineAsync,Color,
              declare,array,BaseWidget,Deferred,on,dom,domStyle,lang,domConstruct,topic,
              Button,Select,
              Chart,Default,Scatter,Lines) {

        return declare([BaseWidget], {

            baseClass: 'jimu-widget-fractaldimension',
            name: 'FractalDimension',

            //-------------------
            // Private variables
            //-------------------
            _highlightGraphicsLayer: null,
            _highlightFillSymbol: null,
            _mapClickHandler: null,
            _numFeatureLayersVizAtScale: null,
            _selectLayerNode: null,
            _inputPassesNode: null,
            _btnSubmitNode: null,
            _numPasses: null,
            _theFeature: null,
            _numAnalysisSteps: 0,
            _numAnalysisProgress: null,
            _analysisResults: [],

             postCreate: function() {
                 this.inherited(arguments);
                 console.log('postCreate');

                 // Display intro/instructions
                 if (this.nls.intro) {
                     this.introNode.innerHTML = this.nls.intro;
                 } else {
                     this.introNode.innerHTML = "No intro text found in nls/Strings";
                 }

                 // -------------------
                 // Set up inputs
                 // -------------------

                 // Set up input: Select target layer
                 this._selectLayerNode = new Select({
                     class: " fdim-input-control"
                 }, domConstruct.place('<div>', this.inputsLayerControlNode));
                 this._selectLayerNode.startup();
                 this._updateSelect();

                 // Listen for potential changes to list of visible feature layers
                 this.own(
                     this.map.on('zoom-end',lang.hitch(this, this._updateSelect)),
                     this.map.on('layer-add',lang.hitch(this, this._updateSelect)),
                     this.map.on('layer-remove',lang.hitch(this, this._updateSelect))
                 );

                 // Set up input: Number of passes
                 this._inputPassesNode = new Select({
                     class: " fdim-input-control"
                 }, domConstruct.place('<div>', this.inputsPassesControlNode));
                 this._inputPassesNode.startup();
                 this._updatePasses();

                 // Set up input: Submit button
                 this._btnSubmitNode = new Button({
                     label: this.nls.btnLabelSelect,
                     id: "fdim-button-submit",
                     disabled: true
                 }, domConstruct.place('<div>',this.inputsSubmitButtonNode));
                 this.own(on(this._btnSubmitNode, "click", lang.hitch(this,
                     this._onSubmitClick)));
                 this.own(on(this._selectLayerNode, "change", lang.hitch(this, function(){
                     console.log("select changed");
                     if (this._selectLayerNode.get("displayedValue")==this.nls.labelSelectLayer ||
                         this._selectLayerNode.get("displayedValue")==this.nls.labelLayerNotFound) {
                         this._btnSubmitNode.set("disabled", true);
                     } else {
                         this._btnSubmitNode.set("disabled", false);
                     }
                 })));

                 // -------------------
                 // Set up outputs
                 // -------------------

                 // set up graphics layer and symbology
                 if (!this._highlightGraphicsLayer) {
                     this._highlightGraphicsLayer = new GraphicsLayer();
                     this.map.addLayers([this._highlightGraphicsLayer]);
                 }
                 if (!this._highlightFillSymbol) {
                     this._highlightFillSymbol = new SimpleFillSymbol(
                         SimpleFillSymbol.STYLE_SOLID,
                         new SimpleLineSymbol(
                             SimpleLineSymbol.STYLE_SOLID,
                             new Color([255,0,0,0.4]),2),
                         new Color([255, 128, 0, 0.25])
                     );
                 }
             },

            _updateSelect: function() {
                console.log("updateSelect");
                var mapLayers = this.map.getLayersVisibleAtScale(this.map.getScale());
                var numCurrentlyVizFeatureLayers = 0;
                var selLayers = [{label: this.nls.labelSelectLayer,value: " ", selected: true}];
                array.forEach(mapLayers, function(lyr) {
                    if (lyr.type) {
                        if (lyr.type==='Feature Layer');
                        numCurrentlyVizFeatureLayers++;
                        selLayers.push({
                            label: lyr.name,
                            value: lyr.id
                        });
                    }
                });
                if (numCurrentlyVizFeatureLayers!=this._numFeatureLayersVizAtScale) {
                    // number of eligible layers has changed
                    this._numFeatureLayersVizAtScale = numCurrentlyVizFeatureLayers;
                    if (selLayers.length < 2) {
                        selLayers.push({
                            label: this.nls.labelLayerNotFound,
                            value: " "
                        });
                    }
                    this._selectLayerNode.set('options', selLayers);
                    this._selectLayerNode.reset();
                }
            },

            _updatePasses: function() {
                var selPasses = [{label: this.config.minPasses+"", value: this.config.minPasses, selected: true}];
                for (var i=this.config.minPasses+1; i<=this.config.maxPasses; i++) {
                    selPasses.push({
                        label: i + "",
                        value: i
                    });
                }
                this._inputPassesNode.set('options', selPasses);
                this._inputPassesNode.reset();
            },

            _onSubmitClick: function () {
                console.log('onSubmitClick');

                if (this._btnSubmitNode.get('label')==this.nls.btnLabelSelect) {
                    console.log('...selecting feature');
                    this._connectMapClickHandler();
                    this._disableWidgetControls(true);
                    this._highlightGraphicsLayer.clear();
                    this._btnSubmitNode.set('label', this.nls.btnLabelCancelSel);
                    domStyle.set("fdim-button-submit","color","red");
                } else if (this._btnSubmitNode.get('label')==this.nls.btnLabelCancelSel) {
                    console.log('...cancelling selection.');
                    this._disconnectMapClickHandler();
                    this._disableWidgetControls(false);
                    this._btnSubmitNode.set('label', this.nls.btnLabelSelect);
                    domStyle.set("fdim-button-submit","color","");
                } else if (this._btnSubmitNode.get('label')==this.nls.btnLabelCancelAna) {
                    console.log('...cancelling analysis.');
                    this._cancelAnalysis();
                    this._btnSubmitNode.set('label', this.nls.btnLabelClear);
                    domStyle.set("fdim-button-submit","color","");
                } else if (this._btnSubmitNode.get('label')==this.nls.btnLabelClear) {
                    console.log('...clearing analysis.');
                    this._clearAnalysis();
                    this._btnSubmitNode.set('label', this.nls.btnLabelSelect);
                }
            },

            startup: function () {
                this.inherited(arguments);
                console.log('startup');
            },

            onOpen: function(){
                console.log('onOpen start');
            },

            onClose: function(){
                console.log('onClose');

                // cancel any analysis that may be taking place
                this._cancelAnalysis();

            },

            _cancelAnalysis: function () {
                console.log("_cancelAnalysis");
                this._disconnectMapClickHandler();
                topic.publish("fdim/cancel"); // cancel any running deferreds
                this.outputsSectionHeadNode.innerHTML = this.nls.labelCancelled;
                this._disableWidgetControls(false);
                this._disableWebMapPopup(false);
                this._selectLayerNode.set('label', this.nls.labelLayer);
                this._btnSubmitNode.set('label', this.nls.btnLabelSelect);
            },

            _clearAnalysis: function () {
                console.log("_clearAnalysis");
                topic.publish("fdim/cancel"); // cancel any running deferreds
                this.outputsSectionHeadNode.innerHTML = this.nls.labelResults;
                this._disableWidgetControls(false);
                dom.byId("outputDimensionValue").innerHTML = "";
                dom.byId("outputRSquaredValue").innerHTML = "";
                this._highlightGraphicsLayer.clear();
                this._btnSubmitNode.set('label', this.nls.btnLabelSelect);
                this.outputChartNode.innerHTML = "";
            },

            _connectMapClickHandler: function () {
                console.log('_connectMapClickHandler');
                this._disableWebMapPopup(true);
                this._mapClickHandler = this.own(this.map.on("click", lang.hitch(this,
                    this._onMapClick)));
            },

            _disconnectMapClickHandler: function () {
                console.log('_disconnectMapClickHandler');
                if (this._mapClickHandler) {
                    if (this._mapClickHandler[0]) {
                        console.log(this._mapClickHandler[0]);
                        this._mapClickHandler[0].remove();
                    }
                }
                this._disableWebMapPopup(false);
            },

            _onMapClick: function (evt) {
                console.log('_onMapClick');
                this.outputsSectionHeadNode.innerHTML = this.nls.labelWorking;

                // get the input parameters, then disable controls
                var fl = this.map.getLayer(this._selectLayerNode.get('value'));
                this._numPasses = this._inputPassesNode.get('value');
                this._disableWidgetControls(true);

                // query the clicked feature in the selected layer
                var query = new Query();
                query.geometry = evt.mapPoint;
                query.returnGeometry = true;
                fl.queryFeatures(query, lang.hitch(this, this._queryComplete)); // TODO: handle error
            },

            _queryComplete: function (results) {
                console.log('_queryComplete');

                // TODO: Consider creating a custom feature action

                this._numAnalysisProgress = 0;
                this._analysisResults = [];

                if (results.features.length === 0) {
                    alert("No feature found.");
                } else {
                    this._theFeature = results.features[0]; // TODO: Validate feature type

                    // prime button for cancellation
                    this._btnSubmitNode.set('label', this.nls.btnLabelCancelAna);

                    // set up progress bar
                    this._numAnalysisProgress = 0;
                    this._numAnalysisSteps = 0;
                    for (var i=1;i<=this._numPasses;i++) {
                        this._numAnalysisSteps = this._numAnalysisSteps + Math.pow(4,i);
                    }

                    // determine the study area
                    var boxGeometry = Polygon.fromExtent(this._theFeature.geometry.getExtent());

                    // TODO: Determine the optimal scaling range
                    //       Use generalized sliding window method to determine upper and lower
                    //       bounds. See Jiang and Liu, "Box-Counting Dimension of Fractal
                    //       Urban Form", 50.

                    // call the recursive function
                    this._doAnalysis(boxGeometry,0);
                }
            },

            _doAnalysis: function (boxGeometry,analysisLevel) {
                "use strict";
                var currentLevel = analysisLevel + 1;
                console.log('... doing analysis at level' + currentLevel);

                // break the box down into quarters
                var tempQuarterBoxGeometries = this._quarterBoxGeometry(boxGeometry);

                // test each quarter-box
                var obj;
                var levelTemplate;
                array.forEach(tempQuarterBoxGeometries, lang.hitch(this, function(qbg){
                    this._analyzeBoxAsync(qbg,this._theFeature.geometry).then(lang.hitch(this, function(result){
                        if (result) {
                            // the box intersects, so:
                            // ... count it...
                            this._numAnalysisProgress += 1;
                            this.outputsSectionHeadNode.innerHTML =
                                this.nls.labelWorking + "&nbsp;" +
                                (Math.round(this._numAnalysisProgress/this._numAnalysisSteps*10000) / 100) + "%";
                            obj = this._findObjectByAttribute(this._analysisResults, "level", currentLevel);
                            if (!obj) {
                                this._analysisResults.push({
                                    level: currentLevel,
                                    N: 1,
                                    r: qbg.getExtent().getWidth()
                                });
                            } else {
                                obj.N += 1;
                            }
                            // ... display it ...
                            this._highlightGraphicsLayer.add(new Graphic(qbg, this._highlightFillSymbol));
                            // ... and analyze it if...
                            if (currentLevel<this._numPasses) {
                                this._doAnalysis(qbg, currentLevel);
                            }
                        } else {
                            // not going to further subdivide, so tally any uncreated boxes
                            for (var i=0;i<(this._numPasses - analysisLevel);i++) {
                                this._numAnalysisProgress += Math.pow(4, i);
                            }
                            this.outputsSectionHeadNode.innerHTML =
                                this.nls.labelWorking + "&nbsp;" +
                                (Math.round(this._numAnalysisProgress/this._numAnalysisSteps*10000) / 100) + "%";
                        }
                        if (this._numAnalysisSteps == this._numAnalysisProgress) {
                            this._printOutputs(this._analysisResults);
                        }
                    }));
                }));
            },

            _printOutputs: function (analysisResults) {
                console.log("Printing outputs...");

                // update button
                this._disconnectMapClickHandler();
                this._disableWidgetControls(false);
                this._disableWebMapPopup(false);
                this._btnSubmitNode.set('label', this.nls.btnLabelClear);
                domStyle.set("fdim-button-submit","color","");


                this.outputsSectionHeadNode.innerHTML = this.nls.labelResults;
                var htmlOutput = "";

                // prepare scatter plot data
                var scatterSeries = array.map(analysisResults, function(item){
                    return { y: Math.log(item.N),
                        x: Math.log(1.0/item.r), size: 3
                    };
                });

                // compute linear regression
                var known_x = array.map(scatterSeries, function(item){
                    return item.x;
                });
                var known_y = array.map(scatterSeries, function(item){
                    return item.y;
                });
                // To reduce bias, computation ignores first 3 results
                // unless needed in order to have at least 2 results
                // for calculating the regression line (dimension)
                var regressionMinPass;
                if (this._numPasses>=5) {
                    regressionMinPass = 3;
                } else {
                    regressionMinPass = this._numPasses - 2;
                }
                var excludeKnownX = known_x.splice(0,regressionMinPass);
                var excludeKnownY = known_y.splice(0,regressionMinPass);
                var lr = this._linearRegression(known_y, known_x);
                var lrSeries = [
                    { x: known_x[0], y: (known_x[0] * lr.slope + lr.intercept) },
                    { x: known_x[known_x.length-1], y: (known_x[known_x.length-1] * lr.slope + lr.intercept)}
                ];

                // round and output dimension, r-squared values
                var d = (Math.round(lr.slope*100000)) / 100000;
                var r = ((Math.round(lr.r2*100000)) / 1000);
                dom.byId("outputDimensionValue").innerHTML = d;
                dom.byId("outputRSquaredValue").innerHTML = r;

                // set up space for chart
                var divChart = domConstruct.place('<div class="fdimChart">', this.outputChartNode);

                // separate the scatterplot points into included/excluded series
                var scatterSeriesIn = array.map(known_x, function(item, i){
                    return { "x": item, "y": known_y[i] }
                });
                var scatterSeriesOut = array.map(excludeKnownX, function(item, i){
                    return { "x": item, "y": excludeKnownY[i] }
                });

                // build the chart
                var chartResults = new Chart(this.outputChartNode);
                chartResults.title = "Scatter Plot";
                chartResults.titlePos = "top";
                chartResults.titleGap = 10;
                chartResults.titleFont = "normal normal normal 12pt Consolas";
                chartResults.addPlot("scatterPlot", { type: "Scatter" });
                chartResults.addPlot("linearPlot", { type: "Lines" });
                chartResults.addAxis("x", {
                    min: scatterSeriesOut[0].x - 0.5,
                    max: scatterSeriesIn[scatterSeriesIn.length-1].x + 0.5,
                    title: "Box Size, log(1/r)",
                    titleGap: 8,
                    titleOrientation: "away",
                    titleFont: "normal normal normal 10pt Consolas",
                    font: "normal normal normal 8pt Consolas"
                });
                chartResults.addAxis("y", {
                    vertical: true,
                    min: scatterSeriesOut[0].y - 0.5,
                    max: scatterSeriesIn[scatterSeriesIn.length-1].y + 0.5,
                    title: "Number of Boxes, log(N(r))",
                    titleGap: 8,
                    titleFont: "normal normal normal 10pt Consolas",
                    font: "normal normal normal 8pt Consolas"
                });
                chartResults.addSeries("scatterSeriesOut", scatterSeriesOut, {
                    plot: "scatterPlot",
                    marker: "m-3,0 c0,-4 6,-4 6,0 m-6,0 c0,4 6,4 6,0", // circle
                    fill: "gray",
                    stroke: { color: "black", width: 1 },
                    size: 5
                });
                chartResults.addSeries("scatterSeriesIn", scatterSeriesIn, {
                    plot: "scatterPlot",
                    marker: "m-3,0 c0,-4 6,-4 6,0 m-6,0 c0,4 6,4 6,0", // circle
                    fill: "lime",
                    stroke: { color: "green", width: 1 },
                    size: 5
                });
                chartResults.addSeries("linearSeries", lrSeries, {
                    plot: "linearPlot",
                    stroke: { color: "black", width: 1 }
                });
                chartResults.render();
                chartResults.setWindow(2,2,2,2);
            },

            _quarterBoxGeometry: function (g) {

                var sr = g.spatialReference;

                var coordsLL = g.rings[0][0];
                var coordsUL = g.rings[0][1];
                var coordsUR = g.rings[0][2];
                var coordsLR = g.rings[0][3];

                var ptLL = new Point(coordsLL, sr);
                var ptUL = new Point(coordsUL, sr);
                var ptUR = new Point(coordsUR, sr);
                var ptLR = new Point(coordsLR, sr);
                var ptCx = (ptUR.x - ptUL.x) / 2 + ptUL.x;
                var ptMy = (ptUR.y - ptLR.y) / 2 + ptLR.y;
                var ptUC = new Point(ptCx, ptUL.y, sr);
                var ptML = new Point(ptUL.x, ptMy, sr);
                var ptMC = new Point(ptCx, ptMy, sr);
                var ptMR = new Point(ptUR.x, ptMy, sr);
                var ptLC = new Point(ptCx, ptLL.y, sr);

                // build the new quarter-box geometries
                var qbgLL = new Polygon(sr);
                qbgLL.addRing([
                    [ptLL.x, ptLL.y],
                    [ptML.x, ptML.y],
                    [ptMC.x, ptMC.y],
                    [ptLC.x, ptLC.y],
                    [ptLL.x, ptLL.y]
                ]);

                var qbgLR = new Polygon(sr);
                qbgLR.addRing([
                    [ptLC.x, ptLC.y],
                    [ptMC.x, ptMC.y],
                    [ptMR.x, ptMR.y],
                    [ptLR.x, ptLR.y],
                    [ptLC.x, ptLC.y]
                ]);

                var qbgUL = new Polygon(sr);
                qbgUL.addRing([
                    [ptML.x, ptML.y],
                    [ptUL.x, ptUL.y],
                    [ptUC.x, ptUC.y],
                    [ptMC.x, ptMC.y],
                    [ptML.x, ptML.y]
                ]);

                var qbgUR = new Polygon(sr);
                qbgUR.addRing([
                    [ptMC.x, ptMC.y],
                    [ptUC.x, ptUC.y],
                    [ptUR.x, ptUR.y],
                    [ptMR.x, ptMR.y],
                    [ptMC.x, ptMC.y]
                ]);

                return [qbgUL, qbgUR, qbgLL, qbgLR];
            },

            _analyzeBoxAsync: function (boxGeometry, featureGeometry) {

                var deferred = new Deferred();
                var handle = topic.subscribe("fdim/cancel", function(){
                    deferred.cancel();
                    handle.remove();
                });

                geometryEngineAsync.intersects(boxGeometry, featureGeometry).then(function(res){
                    if (res) {
                        geometryEngineAsync.within(boxGeometry, featureGeometry).then(function(res){
                            if (!res) {
                                handle.remove();
                                deferred.resolve(true);
                            } else {
                                handle.remove();
                                deferred.resolve(false);
                            }
                        });
                    } else {
                        handle.remove();
                        deferred.resolve(false);
                    }
                });
                return deferred.promise;
            },

            _linearRegression: function (y,x){
                var lr = {};
                var n = y.length;
                var sum_x = 0;
                var sum_y = 0;
                var sum_xy = 0;
                var sum_xx = 0;
                var sum_yy = 0;

                for (var i = 0; i < y.length; i++) {

                    sum_x += x[i];
                    sum_y += y[i];
                    sum_xy += (x[i]*y[i]);
                    sum_xx += (x[i]*x[i]);
                    sum_yy += (y[i]*y[i]);
                }

                lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
                lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
                lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

                return lr;
            },

            _findObjectByAttribute: function (items, attribute, value) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i][attribute] === value) {
                        return items[i];
                    }
                }
                return null;
            },

            _disableWidgetControls: function(booleanDisable) {
                this._selectLayerNode.set('disabled',booleanDisable);
                this._inputPassesNode.set('disabled',booleanDisable);
            },

            _disableWebMapPopup: function (booleanDisable) {
                if (this.map) {
                    this.map.setInfoWindowOnClick(!booleanDisable);
                }
            }

        });
    });