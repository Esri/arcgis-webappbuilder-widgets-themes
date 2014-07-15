define([
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/_base/declare",
    "jimu/BaseWidget",
    "esri/IdentityManager",
    "esri/InfoTemplate",
    "esri/toolbars/draw",
    "esri/layers/StreamLayer",
    "esri/TimeExtent",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/TemporalRenderer",
    "esri/graphic",
    "dojo/_base/Color",
    "dojo/on",
    "dojo/domReady!"
  ],
  function (lang, dom, declare, BaseWidget,
            idManager,
            InfoTemplate,
            Draw,
            StreamLayer,
            TimeExtent,
            SimpleFillSymbol,
            SimpleLineSymbol,
            SimpleMarkerSymbol,
            SimpleRenderer,
            TemporalRenderer,
            Graphic,
            Color,
            on) {
 
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {
      streamLayer: null,
      streamConfigs: null,
      refreshRate: 200,
      svcName: "Flights",
      drawTools: null,
      filterObj: {
        outFields: null,
        geometry: null,
        where: null
      },
      svcurl: null,
 
      //please note that this property is be set by the framework when widget is loaded.
      //templateString: template,
 
      baseClass: "jimu-widget-stream",
 
      name: "StreamWidget",
 
      init: function () {
        //Note: This should not be used in a production environment
        idManager.setProtocolErrorHandler(function(){
          console.log("Protocol mismatch error");
          return window.confirm("Protocol mismatch error .... proceed anyway?");
        });
 
        this.drawTools = new Draw(this.map);
 
        this.map.on("time-extent-change", this.mapTimeChanged);
 
        this.svcurl = this.config.serviceURL;
        console.log("svcurl: ", this.svcurl);
 
        on(dom.byId("cmdToggleStream"), "click", lang.hitch(this, this.toggleStreamLayer));
        on(dom.byId("cmdClearGraphics"), "click", lang.hitch(this, this.clearFlightGraphics));
        on(dom.byId("cmdSetSpatialFilt"), "click", lang.hitch(this, this.drawFilter));
        on(dom.byId("cmdClearSpatialFilt"), "click", lang.hitch(this, this.clearSpatialFilter));
        on(dom.byId("cmdApplyWhere"), "click", lang.hitch(this, this.setWhere));
        on(dom.byId("cmdClearWhere"), "click", lang.hitch(this, this.clearWhere));
        on(dom.byId("cmdApplyOutfields"), "click", lang.hitch(this, this.setOutfields));
        on(dom.byId("cmdClearOutfields"), "click", lang.hitch(this, this.clearOutfields));
        on(this.drawTools, "draw-end", lang.hitch(this, this.setSpatialFilter));
      },
 
      toggleStreamLayer: function (){
        if (this.streamLayer){
          this.disconnectStreamLayer();
        }
        else{
          this.connectStreamLayer();
        }
      },
 
      connectStreamLayer: function () {
        var url = this.svcurl,
            maxPoints,
            useTemporal,
            showTracks,
            maxFeatures;
 
        this.streamConfigs = this.getLayerConfig();
        maxPoints = this.streamConfigs.maxPoints !== null ? this.streamConfigs.maxPoints.toString() : "N/A";
        useTemporal = this.streamConfigs.useTemporal.toString();
        showTracks = this.streamConfigs.useTemporal ? this.streamConfigs.useTemporal : "false";
        maxFeatures = this.streamConfigs.totalMax;
 
        dom.byId("txtMaxPoints").innerHTML = maxPoints;
        dom.byId("txtUseTemporal").innerHTML = useTemporal;
        dom.byId("txtShowTracks").innerHTML = showTracks;
        dom.byId("txtMaxFeatures").innerHTML = maxFeatures;
 
        this.streamLayer = this.makeStreamLayer(url, this.streamConfigs);
      },
 
      disconnectStreamLayer: function (){
        if (this.streamLayer){
          this.streamLayer.suspend();
          this.streamLayer.clear();
          this.streamLayer.disconnect();
          this.map.removeLayer(this.streamLayer);
          this.streamLayer = null;
          this.streamConfigs = null;
 
          var graphic;
          if (this.map.graphics.graphics.length > 1){
            graphic = this.map.graphics.graphics[1];
            this.map.graphics.remove(graphic);
          }
 
          this.filterObj = {
            outFields: null,
            geometry: null,
            where: null
          };
        }
      },
 
      makeStreamLayer: function (url, layerConfigs){
        var layer,
            options = {
              purgeOptions: { displayCount: 1500 },
              infoTemplate: new InfoTemplate("Attributes", "${*}")
            };
 
        console.log("layerConfigs: ", layerConfigs);
 
        layerConfigs = layerConfigs || {};
        if (layerConfigs.maxPoints !== null){
          options.maximumTrackPoints = layerConfigs.maxPoints;
        }
 
        if (layerConfigs.totalMax){
          options.purgeOptions.displayCount = layerConfigs.totalMax;
        }
 
        if (layerConfigs.refreshRate || layerConfigs.refreshRate === 0){
          options.refreshRate = layerConfigs.refreshRate;
        }
        console.log("purgeOptions: ", options.purgeOptions);
 
        layer = new StreamLayer(url, options);
 
        layer.on("message", function(m){
          //console.log("Message: ",m);
          //console.log("StreamLayer: ", streamLayer);
        });
 
        layer.on("graphic-add", function(g){
          //console.log("Graphic: ",g);
          //console.log("this.map end time: ", Date.parse(this.map.timeExtent.endTime.toUTCString()));
          //console.log("StreamLayer: ", streamLayer);
        });
 
        layer.on("Connect", function(){
          dom.byId("cmdToggleStream").value = "Stop Stream";
          dom.byId("divStreamingView").style.display = "block";
          dom.byId("cmdClearGraphics").style.visibility = "visible";
        });
 
        layer.on("Disconnect", function(){
          dom.byId("cmdToggleStream").value = "Start Stream";
          dom.byId("cmdClearGraphics").style.visibility = "hidden";
        });
 
        layer.on("load", lang.hitch(this, function(evt){
          var lyr = evt.layer,
              renderer;
 
          console.log("layer loaded: ", lyr);
          if (layerConfigs.useTemporal){
            renderer = this.makeTemporalRenderer(lyr.geometryType, layerConfigs.showTracks);
          }
          else{
            renderer = this.makeRenderer(lyr.geometryType);
          }
          lyr.setRenderer(renderer);
          this.map.addLayer(lyr);
        }));
 
        return layer;
      },
 
      clearFlightGraphics: function (){
        if (this.streamLayer){
          this.streamLayer.clear();
 
          if (this.streamLayer._trackManager){
            this.streamLayer._trackManager.clearTracks();
          }
        }
      },
 
      getLayerConfig: function (){
        var maxPoints = null,
            useTemporal = true,
            showTracks,
            totalMax,
            refreshRate,
            configs = null;
 
        this.streamConfigs = this.streamConfigs || {};
        showTracks = this.config.showLines === true;

        maxPoints = this.config.showTracks === true ? this.config.numMaxTrackPoints : 10;
 
        totalMax = this.config.totalMax;
        console.log("TotalMax: ", totalMax);
 
        if (this.streamConfigs.maxPoints !== maxPoints ||
            this.streamConfigs.showTracks !== showTracks ||
            this.streamConfigs.refreshRate !== refreshRate){
          configs = {
            useTemporal: true,
            maxPoints : null,
            showTracks: this.streamConfigs.showTracks !== showTracks ? showTracks : null,
            totalMax: this.streamConfigs.totalMax !== totalMax ? totalMax : null,
            refreshRate: this.streamConfigs.refreshRate !== refreshRate ? refreshRate : null
          };
        }
        //return configs;
		return {
		useTemporal: false,
		maxPoints:null,
		showTracks:false,
		totalMax:10000,
		refreshRate:null
		};
      },
 
      setWhere: function (){
        var where = dom.byId("txtWhere").value;
        if (where){
          this.filterObj.where = where;
        }
        //console.log("filterObj: ", filterObj);
        this.applyFilter(this.filterObj);
      },
 
      clearWhere: function (){
        this.filterObj.where = null;
        //console.log("filterObj: ", filterObj);
        this.applyFilter(this.filterObj);
      },
 
      setOutfields: function (){
        var outfields = dom.byId("txtOutfields").value;
        //console.log("outfields: ", outfields);
        if (outfields){
          this.filterObj.outFields = outfields;
        }
        //console.log("filterObj: ", filterObj);
        this.applyFilter(this.filterObj);
      },
 
      clearOutfields: function (){
        this.filterObj.outFields = null;
        //console.log("filterObj: ", filterObj);
        this.applyFilter(this.filterObj);
      },
 
      drawFilter: function (){
        /*if (! streamLayer){
         return false;
         }*/
        this.drawTools.activate(Draw.EXTENT);
        //streamLayer.setDefinitionExpression("FltId = 'UA12345'");
      },
 
      setSpatialFilter: function (s){
        this.drawTools.deactivate();
        var graphic,
            geom;
        if (s){
          geom = s.geometry;
          this.filterObj.geometry = geom;
          this.applyFilter(this.filterObj);
 
          if (this.map.graphics.graphics.length > 1){
            graphic = this.map.graphics.graphics[1];
            graphic.setGeometry(geom);
          }
          else{
            graphic = new Graphic(geom,
              new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                  new Color( [5, 112, 176] ), 2),
                new Color( [5, 112, 176, 0] )));
            this.map.graphics.add(graphic);
            //clearFlightGraphics();
          }
        }
      },
 
      clearSpatialFilter: function (){
        this.filterObj.geometry = null;
        //console.log("filterObj: ", filterObj);
        this.applyFilter(this.filterObj);
 
        var graphic;
        if (this.map.graphics.graphics.length > 1){
          graphic = this.map.graphics.graphics[1];
          this.map.graphics.remove(graphic);
        }
      },
 
      applyFilter: function (filter){
        var filterText = "No filter currently set";
 
        if (filter){
          filterText = JSON.stringify(filter);
        }
 
        if (!this.streamLayer){
          console.log("No Stream Layer created. Filter will be applied on creation");
          return false;
        }
 
        //console.log("Filter: ", filter);
        this.streamLayer.setFilter(filter);
      },
 
      makeRenderer: function (geomType, ptSize){
        var fillcolor = ptSize ? new Color([5, 112, 176, 0.5]) : new Color([5, 112, 176, 0.8]),
            outlinecolor = new Color([255, 255, 255]),
            outline = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, outlinecolor, 1),
            symbol,
            obsRenderer;
 
        ptSize = ptSize || 10;
 
        if (geomType === "esriGeometryPoint"){
          symbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, ptSize, outline, fillcolor);
        }
        else if (geomType === "esriGeometryPolyline"){
          fillcolor = new Color([150, 0, 0, 0.5]);
          symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, fillcolor, 1);
        }
        else if (geomType === "esriGeometryPolygon"){
          fillcolor = new Color([5, 112, 176, 0.2]);
          outlinecolor = new Color([5, 112, 176, 0.8]);
          outline = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, outlinecolor, 1);
          symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, outline, fillcolor);
        }
 
        obsRenderer = new SimpleRenderer(symbol);
 
        return obsRenderer;
      },
 
      makeTemporalRenderer: function (geomType, showTracks){
        var timeField,
            trackField,
            curPositionRenderer,
            positionRenderer,
            lineRenderer;
 
        if (this.streamLayer && this.streamLayer.timeInfo){
          timeField = this.streamLayer.timeInfo.startTimeField;
          trackField = this.streamLayer._trackIdField || this.streamLayer.timeInfo.trackIdField;
        }
 
        //        if (! timeField || ! trackField){
        //          return this.makeRenderer(geomType);
        //        }
 
        curPositionRenderer = this.makeRenderer(geomType);
        positionRenderer = this.makeRenderer(geomType, 6);
        lineRenderer = showTracks ? this.makeRenderer("esriGeometryPolyline") : null;
 
        return new TemporalRenderer(positionRenderer, curPositionRenderer, lineRenderer);
      },
 
      bumpTime: function (){
        var tx = this.map.timeExtent,
            end;
 
        if (! tx){
          console.log("No time extent on this.map to bump");
          return false;
        }
        end = tx && tx.endTime ? Date.parse(tx.endTime.toUTCString()) + 1000 : null;
 
        this.map.setTimeExtent(new TimeExtent(this.map.timeExtent.startTime, new Date(end)));
      },
 
      mapTimeChanged: function (e){
        console.log("this.map time extent: ", this.map.timeExtent);
        if (this.streamLayer){
          console.log("Stream Layer: ", this.streamLayer);
        }
      },
 
      refreshLayer: function (){
        if (this.streamLayer){
          this.streamLayer.refresh();
        }
      },
 
      postCreate: function() {
        this.inherited(arguments);
        console.log("postCreate");
      },
 
      startup: function() {
        this.inherited(arguments);
        this.init();
        console.log("startup");
      },
 
      onOpen: function(){
        console.log("onOpen");
      },
 
      onClose: function(){
        console.log("onClose");
      },
 
      onMinimize: function(){
        console.log("onMinimize");
      },
 
      onMaximize: function(){
        console.log("onMaximize");
      },
 
      onSignIn: function(credential){
        /* jshint unused:false*/
        console.log("onSignIn");
      },
 
      onSignOut: function(){
        console.log("onSignOut");
      }
    });
  });