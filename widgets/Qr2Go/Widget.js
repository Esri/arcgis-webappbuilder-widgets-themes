///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
  'dojo/parser', 
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'jimu/BaseWidget',
  'esri/geometry/Point',
  'esri/geometry/webMercatorUtils',
  'dojo/on',
  './qrcodejs/qrcode',
  "dojo/dom",
  "dojo/query",
  "dojo/NodeList-traverse"
],
function(parser, declare, lang, array, html, BaseWidget, Point, webMercatorUtils, on,
  qrcode, dom, query) 
{
  return declare([BaseWidget], 
  {
    //these two properties is defined in the BaseWidget
    baseClass: 'jimu-widget-qr2go',
    name: 'Qr2Go',

    startup: function()
	{
      this.inherited(arguments);
	  this.qrCodeObj = new QRCode(this.qrCodeNode);
	  
		
	  /*this.bookmarkListNode*/
    },
	
	onMapClick: function(event){
		xy = webMercatorUtils.xyToLngLat(event.mapPoint.x, event.mapPoint.y, true);
		
		this.x = xy[0];
		this.y = xy[1];
		
		this.generateQr();
		
	},
	
	generateQr: function(){
		
		this.qrCodeObj.clear(); // clear the code.
		var selected = "";
		
		/*
        with(this.form)
			with(elements[0])
				with(elements[checked?0:1])
					selected = value;
		*/
		
		selected = query(this.form).children("input[type=radio]:checked")[0].value;
		
		if (selected == "google")
		{
			this.qrCodeObj.makeCode("http://maps.google.com?q="+this.y+","+this.x); // make another code.
		}
		else if (selected == "trek2there")
		{
			this.qrCodeObj.makeCode("arcgis-trek2there://?stop="+this.y+","+this.x); // make another code.
		}
		else
		{
			this.qrCodeObj.makeCode("arcgis-navigator://?stop="+this.y+","+this.x); 
		}
		
	},

    onOpen: function(){
      this.eventClick = on(this.map, "click", lang.hitch(this, this.onMapClick));
	  var radios = query(this.form).children("input[type=radio]");
	  this.toogleEvents = [];
	  radios.forEach(
		function (radio) {
			this.toogleEvents.push(on(radio, "change", lang.hitch(this, this.generateQr)));
		}, this
	  );
    },

    onClose: function(){
		this.eventClick.remove();
    },

    onMinimize: function(){
      this.resize();
    },

    onMaximize: function(){
      this.resize();
    },

    resize: function(){
    },

    destroy: function(){
      this.inherited(arguments);
    },

  });
});