define([
  "dojo/_base/declare", 
  "dojo/_base/array",
  "dijit/registry",
  "dijit/Dialog",
  "dojox/widget/ColorPicker",
  "dijit/form/SimpleTextarea",
  "dijit/form/CheckBox",
  "dijit/_WidgetsInTemplateMixin",
  "jimu/BaseWidget", 
  "esri/layers/FeatureLayer",
  "esri/layers/GraphicsLayer",
  "esri/layers/layer",  
  "dijit/form/ValidationTextBox",
  "dijit/form/Textarea",
  "dijit/form/TextBox",
  "esri/tasks/locator",
  "esri/graphic",
  "esri/geometry/Point",
  "esri/InfoTemplate", 
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/TextSymbol",
  "esri/symbols/Font",
  "esri/geometry/Extent",
  "dojo/_base/Color",
  "http://ec2-54-187-229-112.us-west-2.compute.amazonaws.com:8080/socket.io/socket.io.js"
  ],
function(
  declare,
  arrayUtils,
  registry, 
  Dialog,
  ColorPicker,
  SimpleTextarea,
  CheckBox,
  _WidgetsInTemplateMixin, 
  BaseWidget, 
  FeatureLayer, 
  GraphicsLayer,
  Layer,
  ValidationTextBox,
  Textarea,
  TextBox,
  Locator,
  Graphic,
  Point,
  InfoTemplate, 
  SimpleMarkerSymbol,
  TextSymbol,
  Font,
  Extent,
  Color,
  io
  ) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget, _WidgetsInTemplateMixin], {

	baseClass: 'jimu-widget-geochat-setting',

    name: 'GeoChat',
	
	serverAddress: 'http://ec2-54-187-229-112.us-west-2.compute.amazonaws.com:8080',
	
	serverDisplayName: 'GeoChat',

	shareGraphicLayer: null,
	
	shareTextLayer: null,
	
	lastMouseGraphic: null, 
	
	lastMouseText: null, 
	
	lastLocationGraphic: null,
	
	lastLocationText: null,

	locationTimer: null,
	
	locationUpdateFrequency: 1000,
	
	currentSelfExtent: null,
	
	socket: null,

	currentRoom: null,
	
	chatRooms: {},
	
	currentClients: {},
	
	settingClients: {},
	
	nickname: "Unknown",
	
	colorRed : 0,

	colorGreen : 0,

	colorBlue : 0,
	
	colorAlpha : 0,
	
	clientId: null,
	
	personIconPath: "M20.771,12.364c0,0,0.849-3.51,0-4.699c-0.85-1.189-1.189-1.981-3.058-2.548s-1.188-0.454-2.547-0.396c-1.359,0.057-2.492,0.792-2.492,1.188c0,0-0.849,0.057-1.188,0.397c-0.34,0.34-0.906,1.924-0.906,2.321s0.283,3.058,0.566,3.624l-0.337,0.113c-0.283,3.283,1.132,3.68,1.132,3.68c0.509,3.058,1.019,1.756,1.019,2.548s-0.51,0.51-0.51,0.51s-0.452,1.245-1.584,1.698c-1.132,0.452-7.416,2.886-7.927,3.396c-0.511,0.511-0.453,2.888-0.453,2.888h26.947c0,0,0.059-2.377-0.452-2.888c-0.512-0.511-6.796-2.944-7.928-3.396c-1.132-0.453-1.584-1.698-1.584-1.698s-0.51,0.282-0.51-0.51s0.51,0.51,1.02-2.548c0,0,1.414-0.397,1.132-3.68H20.771z",

	personChatPath: "M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466zM20.729,7.375c0.934,0,1.688,1.483,1.688,3.312S21.661,14,20.729,14c-0.932,0-1.688-1.483-1.688-3.312S19.798,7.375,20.729,7.375zM11.104,7.375c0.932,0,1.688,1.483,1.688,3.312S12.037,14,11.104,14s-1.688-1.483-1.688-3.312S10.172,7.375,11.104,7.375zM16.021,26c-2.873,0-5.563-1.757-7.879-4.811c2.397,1.564,5.021,2.436,7.774,2.436c2.923,0,5.701-0.98,8.215-2.734C21.766,24.132,18.99,26,16.021,26z",
	
    postCreate: function() {
      this.inherited(arguments);
    },

    startup: function() {
		this.inherited(arguments);

		//Initialize the client attributes
		this.colorRed = Math.floor((Math.random()*255)+1);
		this.colorGreen = Math.floor((Math.random()*255)+1);
		this.colorBlue = Math.floor((Math.random()*255)+1);
		this.colorAlpha = 0.35;

		//Add shared text layer
		this.shareTextLayer = new GraphicsLayer({
										id:"GeoChatShareTextLayer"
									});	
		this.map.addLayer(this.shareTextLayer);									
		
		//Add shared graphics layer
		this.shareGraphicLayer = new GraphicsLayer({
										id:"GeoChatShareLayer",
										styling:false,
										dataAttributes:["client_id"]
									});
									
		if (this.shareGraphicLayer.surfaceType === "svg") {
                    this.shareGraphicLayer.on("graphic-draw", function (evt) {
						var client_id = evt.graphic.attributes.client_id;
						var client_nickname = evt.graphic.attributes.client_nickname;
						client_color = evt.graphic.attributes.client_color;
						if (client_id != undefined){
							evt.node.setAttribute("stroke", client_color);
							evt.node.setAttribute("data-classification", client_id);
						}
                    }.bind(this));
        }
		else {
              alert("Your browser does not support SVG.\nPlease user a modern web browser that supports SVG.");
		}
  	    this.map.addLayer(this.shareGraphicLayer);
		
		this.map.on("mouse-move", function(mouseEvent){
			if(this.shareMyCursor.checked != true)
				return;
			if(this.socket == null)
				return;
			if(this.lastMouseGraphic)
				this.shareGraphicLayer.remove(this.lastMouseGraphic);
			if(this.lastMouseText)
				this.shareTextLayer.remove(this.lastMouseText);
				
			var graphic = new Graphic(mouseEvent.mapPoint);
			graphic.setAttributes( {"client_id":"1", "client_color": "rgb(" + this.colorRed + ", " + this.colorGreen + ", " + this.colorBlue +")"});
			
			var textGraphic = this.createShareText(mouseEvent.mapPoint, this.nickname + "'s Cursor", null);			
			
			this.shareGraphicLayer.add(graphic);
			this.shareTextLayer.add(textGraphic);			
			this.lastMouseGraphic = graphic;
			this.lastMouseText = textGraphic;
			
			this.socket.emit('chatmessage', { message: {type: "update-cursor", content: mouseEvent.mapPoint}, room: this.currentRoom });
		}.bind(this));
		
		this.currentSelfExtent = this.map.extent;
		this.map.on("extent-change", function(evt) {
			var delta = evt.delta,
				extent = evt.extent,
				levelChange = evt.levelChange;

			this.currentSelfExtent = extent;
			
			if(this.shareMyExtent.checked && this.socket != null) {
				var jsonExtent = extent.toJson();
				this.socket.emit('chatmessage', { message: {type: "update-extent", content: jsonExtent}, room: this.currentRoom });
			}
		 }.bind(this));
    },
	
	createShareText: function(geom, displayText, attr) {
		var font = new Font(
                "12pt",
                Font.STYLE_NORMAL, 
                Font.VARIANT_NORMAL,
                "Helvetica"
              );
		var textSymbol = new TextSymbol(
                displayText,
                font,
                new Color("#666633")
              );
		textSymbol.setOffset(12,-12);

		var graphic = new Graphic(geom, textSymbol);
		return graphic;
	},
	
	shareExtentChange: function() {
		if(this.socket == null)
			return;
			
		if(this.shareMyExtent.checked != true){	
			this.socket.emit('chatmessage', { message: {type: "remove-extent", content: null}, room: this.currentRoom });
		}
		else{
			var currentExtent = this.map.extent;
			var jsonExtent = currentExtent.toJson();
			this.currentSelfExtent = currentExtent;
			if(this.shareMyExtent.checked && this.socket != null) {
				this.socket.emit('chatmessage', { message: {type: "update-extent", content: jsonExtent}, room: this.currentRoom });
			}
			
			this.refreshClientList();
		}
	},
	
	shareLocationChange: function() {
		if(this.socket == null)
			return;
		if(this.shareMyLocation.checked != true){
				//stop timer
				clearInterval(this.locationTimer);
				this.locationTimer = null;
				//clear graphic
				if(this.lastLocationGraphic){
					this.shareGraphicLayer.remove(this.lastLocationGraphic);
				}
				if(this.lastLocationText){
					this.shareTextLayer.remove(this.lastLocationText);
				}
				//notify others
				this.socket.emit('chatmessage', { message: {type: "remove-location", content: null}, room: this.currentRoom });
		}
		else {
			this.locationTimer = setInterval(update_current_location.bind(this), this.locationUpdateFrequency);
		}
		
		function update_current_location() {
			if(this.shareMyLocation.checked != true)
				return;
			if (navigator.geolocation){
					navigator.geolocation.getCurrentPosition(function(position){
						if(this.lastLocationGraphic){
							this.shareGraphicLayer.remove(this.lastLocationGraphic);
						}
						if(this.lastLocationText){
							this.shareTextLayer.remove(this.lastLocationText);
						}
						
						var graphic = new Graphic(new Point([position.coords.longitude, position.coords.latitude]));
						graphic.setAttributes( {"client_id":"0", "client_color": "rgb(" + this.colorRed + ", " + this.colorGreen + ", " + this.colorBlue +")"});
						
						var textGraphic = this.createShareText(new Point([position.coords.longitude, position.coords.latitude]), this.nickname, null);
						
						this.shareGraphicLayer.add(graphic);
						this.shareTextLayer.add(textGraphic);
						this.lastLocationGraphic = graphic;
						this.lastLocationText = textGraphic;
						
						if(this.socket == null)	return;
						this.socket.emit('chatmessage', { message: {type: "update-location", content: {longitude: position.coords.longitude, latitude: position.coords.latitude}}, room: this.currentRoom });
			  }.bind(this));
			}		  
		}
	},

	shareCursorChange: function() {
		if(this.socket == null)
			return;
		if(this.shareMyCursor.checked != true){
			//clear graphic
			if(this.lastMouseGraphic)
				this.shareGraphicLayer.remove(this.lastMouseGraphic);
			if(this.lastMouseText)
				this.shareTextLayer.remove(this.lastMouseText);				
			//notify others
			this.socket.emit('chatmessage', { message: {type: "remove-cursor", content: null}, room: this.currentRoom });
		}
	},
	
    textchange: function() {
		var currentText = this.iputText.get("value");
		var lastString = currentText.slice(-1);

		if(lastString != ']')
			return;

		var lastSymbolIndex = currentText.lastIndexOf('[');
		var strInputCut = currentText.substring(lastSymbolIndex+1, currentText.length-1);
		if(strInputCut.length < 1)
			return;

		this.locate(strInputCut);
    },

	textKeyPress: function(e){
		if(this.socket == null){
			//alert('Please start or join a conversation first.');
			this.iputText.set("value","");
			return;
		}
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 13) { //Enter keycode
			var message = this.iputText.get("value");
			this.socket.emit('chatmessage', { message: {type: "text", content: message} , room: this.currentRoom });
			this.addChatText(this.nickname, message);
			this.iputText.set("value","");
		}
	},
	
	userNameKeyPress: function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 13) { //Enter keycode
			this.connect();
		}
	},
		
	confIDKeyPress: function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 13) { //Enter keycode
			this.connect();
		}
	},
	
    locate: function(strAddress) {
      var locator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
      locator.on("address-to-locations-complete", showResults.bind(this));

      var address = {
        "SingleLine": strAddress
      };
      locator.outSpatialReference = this.map.spatialReference;
      var options = {
        address: address,
        maxLocations: 1,
        outFields: ["Loc_name"]
      }
	  
	  if(this.currentExtent.checked == true)
		options.searchExtent = this.map.extent;
	  
      locator.addressToLocations(options);
      var infoTemplate = new InfoTemplate(
        "Location", 
        "Address: ${address}<br />Score: ${score}<br />Source locator: ${locatorName}"
      );

      function showResults(evt) {
          var candidate;
          var geom;
          if(evt.addresses.length > 0){
              var candidate = evt.addresses[0];
              geom = candidate.location;
			  
              var attributes = { 
                address: candidate.address, 
                score: candidate.score, 
                locatorName: candidate.attributes.Loc_name,
				"client_id":"1", 
				"client_color": "rgb(" + this.colorRed + ", " + this.colorGreen + ", " + this.colorBlue +")",
				"client_nickname": this.nickname
              };               
              
  		      var graphic = new Graphic(geom, null, attributes, infoTemplate);
              this.shareGraphicLayer.add(graphic);
			  var textGraphic = this.createShareText(geom, this.nickname + " : "+ candidate.address, null);
 			  this.shareTextLayer.add(textGraphic);
			  
              if ( geom !== undefined) {
                  if(this.autoExtent.checked == true)
					this.map.centerAndZoom(geom, 12);
              }
          }
      }
    },

	addChatText: function(by,text){  
		var client = this.currentClients[by];
		if(client == null || client == undefined)
			return;

		var maxCharLine = 35;
		var textStringArray = [];
		var numLine = Math.ceil(text.length/maxCharLine);
		for(var index=0; index<numLine; index++){
			textStringArray[index] = text.substr(maxCharLine*index, maxCharLine);
		}
		var widthText = 230;
		var xOffsetText = 0;
		if(numLine == 1)
			widthText =  text.length * 8;
		if(!client.isMe)
			xOffsetText = 30;
			
		var currentDate = new Date();
	   
		var svgNS = "http://www.w3.org/2000/svg";  
		var svgNode = document.createElementNS(svgNS, "svg");  
		svgNode.setAttributeNS(null,"height",20 + numLine*20);
		svgNode.setAttributeNS(null,"width","100%");

		var myIconPath = document.createElementNS(svgNS,"path");
		myIconPath.setAttributeNS(null,"d",this.personChatPath);
		myIconPath.setAttributeNS(null,"fill","rgb(" + client.colorRed + ", " + client.colorGreen + ", " + client.colorBlue +")");
		if(xOffsetText==0) myIconPath.setAttributeNS(null,"transform","scale(0.9)");
		else myIconPath.setAttributeNS(null,"transform","translate(290, 0) scale(0.9)");
		myIconPath.setAttributeNS(null,"fill-opacity", 0.6);
		myIconPath.setAttributeNS(null,"chat-nickname",client.nickname);
		svgNode.appendChild(myIconPath);

		var myIconDateText = document.createElementNS(svgNS,"text");
		myIconDateText.setAttributeNS(null,"x", 50 + xOffsetText);
		myIconDateText.setAttributeNS(null,"y", 10);
		myIconDateText.setAttributeNS(null,"font-family", "Verdana");
		myIconDateText.setAttributeNS(null,"font-size", 10);
		myIconDateText.setAttributeNS(null,"fill","rgb(170, 170, 170)");
		myIconDateText.innerHTML = currentDate.toLocaleDateString() + " " + currentDate.toLocaleTimeString();
		svgNode.appendChild(myIconDateText);
		
		var myChatRect = document.createElementNS(svgNS,"rect");
		if(xOffsetText!=0 && numLine==1) 
			myChatRect.setAttributeNS(null,"x", 35 + 250 - widthText);
		else
			myChatRect.setAttributeNS(null,"x", 30 + xOffsetText);
		myChatRect.setAttributeNS(null,"y", 15);
		myChatRect.setAttributeNS(null,"rx", 10);
		myChatRect.setAttributeNS(null,"ry", 10);
		myChatRect.setAttributeNS(null,"width", widthText);
		myChatRect.setAttributeNS(null,"height",  numLine*20);
		myChatRect.setAttributeNS(null,"fill-opacity", 0.2);
		myChatRect.setAttributeNS(null,"fill","rgb(" + client.colorRed + ", " + client.colorGreen + ", " + client.colorBlue +")");
		svgNode.appendChild(myChatRect);
		
		var myChatText = document.createElementNS(svgNS,"text");
		myChatText.setAttributeNS(null,"font-family", "Fortuna Dot");
		myChatText.setAttributeNS(null,"font-size", 14);
		myChatText.setAttributeNS(null,"fill","rgb(0,0,0)");
		for(var index=0; index<numLine; index++){
			var myChatTextSpan = document.createElementNS(svgNS,"tspan");
			if(xOffsetText!=0 && numLine==1) 
				myChatTextSpan.setAttributeNS(null,"x", 35 + 5 + 250 - widthText);
			else
				myChatTextSpan.setAttributeNS(null,"x", 35 + xOffsetText);
			if(index==0)
				myChatTextSpan.setAttributeNS(null,"y", 30);
			else
				myChatTextSpan.setAttributeNS(null,"dy", 20);
			myChatTextSpan.innerHTML = textStringArray[index];
			myChatText.appendChild(myChatTextSpan);
		}
		svgNode.appendChild(myChatText);
		
		var ca = document.getElementById('chatArea');  
		ca.appendChild(svgNode);  
		ca.scrollTop = 50000;  
	},
	
	setCurrentRoom: function(room){
		this.currentRoom = room;
	},
	
	// add a room to the rooms list, socket.io may add
	// a trailing '/' to the name so we are clearing it
	addRoom: function(name, chatRooms){
		// clear the trailing '/'
		name = name.replace('/','');
		chatRooms[name] = name;
	},
	
	// remove a room from the rooms list
	removeRoom: function(name, chatRooms){
		if(chatRooms[name] != undefined)
		{
			chatRooms[name] = null;
		}	
	},
	
	// add a client to the clients list
	addClient: function(client, isMe){
		this.currentClients[client.nickname] = client;
		this.currentClients[client.nickname].lastReceiveMouseGraphic = null;
		this.currentClients[client.nickname].lastReceiveMouseText = null;
		this.currentClients[client.nickname].lastReceiveLocationGraphic = null;
		this.currentClients[client.nickname].lastReceiveLocationText = null;
		if(isMe)
			this.currentClients[client.nickname].isMe = true;
		else
			this.currentClients[client.nickname].isMe = false;
		
		this.settingClients[client.nickname] = {	//activeExtent:   true,
													activeLocation: true,
													activeCursor:   true,
													activeDrawings: true,
													activePlaces:   true};
	},
	
	// remove a client to the clients list
	removeClient: function(client){
		this.clearClientGraphic_Text(client.nickname, "all");
		
		this.map.setExtent(this.currentSelfExtent, false);
		if(client.shareMyExtent){
			client.shareMyExtent = false;
			this.refreshClientList();
		}

		if(this.currentClients[client.nickname] != undefined)
		{
			this.currentClients[client.nickname] = null;
		}
		if(this.settingClients[client.nickname] != undefined)
		{
			this.settingClients[client.nickname] = null;
		}
	},
	
	clearClientGraphic_Text: function(nickname, type){
		var client = this.currentClients[nickname];
		if(client == null || client == undefined)
			return;
		
		if(type == "all" || type == "cursor"){
			if(client.lastReceiveMouseGraphic !=null)
				this.shareGraphicLayer.remove(client.lastReceiveMouseGraphic);
			if(client.lastReceiveMouseText !=null)
				this.shareTextLayer.remove(client.lastReceiveMouseText);
			client.lastReceiveMouseGraphic = null;
			client.lastReceiveMouseText = null;
		}
		
		if(type == "all" || type == "location"){
			if(client.lastLocationGraphic !=null)
				this.shareGraphicLayer.remove(client.lastLocationGraphic);
			if(client.lastLocationText !=null)
				this.shareTextLayer.remove(client.lastLocationText);
			client.lastLocationGraphic = null;
			client.lastLocationText = null;	
		}
	},
	
	onClickClientList: function() {
		var srcElement = window.event.srcElement;
		var nickname = srcElement.getAttributeNS(null, "chat-nickname");
		var chatSetting = srcElement.getAttributeNS(null, "chat-setting");
		
		if(this.settingClients[nickname] != undefined && this.currentClients[nickname] != undefined){
			switch (chatSetting) {
			  case "extent":
				if(this.currentClients[nickname].shareMyExtent)
					if(this.currentClients[nickname].lastUpdatedExtent != null)
						this.map.setExtent(this.currentClients[nickname].lastUpdatedExtent);
				break;
			  case "location":
				if(this.currentClients[nickname].shareMyLocation){
					this.settingClients[nickname].activeLocation = !this.settingClients[nickname].activeLocation;
					if(!this.settingClients[nickname].activeLocation)
						this.clearClientGraphic_Text(nickname, "location");
				}
				break;
			  case "cursor":
				if(this.currentClients[nickname].shareMyCursor){
					this.settingClients[nickname].activeCursor = !this.settingClients[nickname].activeCursor;
					if(!this.settingClients[nickname].activeCursor)
						this.clearClientGraphic_Text(nickname, "cursor");
				}
				break;
			  case "drawings":
				if(this.currentClients[nickname].shareMyDrawings)
					this.settingClients[nickname].activeDrawings = !this.settingClients[nickname].activeDrawings;
				break;
			  case "places":
				if(this.currentClients[nickname].shareMyPlaces)
					this.settingClients[nickname].activePlaces = !this.settingClients[nickname].activePlaces;
				break;
			  default:
				break;
			}
			this.refreshClientList();
		}
	},
	
	onClickChatIcon: function() {
		var srcElement = window.event.srcElement;
		var nickname = srcElement.getAttributeNS(null, "chat-nickname");
		
		if(!this.currentClients[nickname].isMe)
			return;
		
		this.colorPicker.onChange = function(newValue) {
			//srcElement.setAttributeNS(null,"fill",newValue);
		}.bind(this);
		
		this.btnColorPickerOK.onClick = function() {
			var client = this.currentClients[nickname];
			srcElement.setAttributeNS(null,"fill",this.colorPicker.get('value'));
			this.colorRed = hexToR(this.colorPicker.get('value'));
			this.colorGreen = hexToG(this.colorPicker.get('value'));
			this.colorBlue = hexToB(this.colorPicker.get('value'));
			client.colorRed = this.colorRed;
			client.colorGreen = this.colorGreen;
			client.colorBlue = this.colorBlue;
			
			if(client != null && client != undefined){
				var userProfile = { 
							colorRed: this.colorRed,
							colorGreen: this.colorGreen,
							colorBlue: this.colorBlue,
							colorAlpha: this.colorAlpha,
							shareMyExtent: this.shareMyExtent.checked,
							shareMyLocation: this.shareMyLocation.checked,
							shareMyCursor: this.shareMyCursor.checked,
							shareMyDrawings: false,
							shareMyPlaces: false
				};
				if(this.socket != null) {
					this.socket.emit('chatmessage', { message: {type: "update-profile", content: userProfile}, room: this.currentRoom });
				}				
			}
			this.dialogColor.hide();
		}.bind(this);
		
		this.dialogColor.show();
		
		function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
		function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
		function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
		function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
	},
	
	refreshClientList: function(){
	  var clientNode = document.getElementById('clientNameList');  
	  while(clientNode.firstChild) {
		clientNode.removeChild(clientNode.firstChild);
	  }
	
	  for (var key in this.currentClients) {
		var client = this.currentClients[key];
		if(client != null && client != undefined){
			var nickname = client.nickname;
			if(client.isMe)
			{
				nickname = client.nickname + ' (You)';
				if(this.shareMyExtent.checked)
					nickname = nickname + " - Sharing Extent";
				client.colorRed = this.colorRed;
				client.colorGreen = this.colorGreen;
				client.colorBlue = this.colorBlue;
				client.colorAlpha = this.colorAlpha;
			}
				
			var colorRed = client.colorRed;
			var colorGreen = client.colorGreen;
			var colorBlue = client.colorBlue;
			var colorAlpha = client.colorAlpha;
				
			var svgNS = "http://www.w3.org/2000/svg";  
			var svgNode = document.createElementNS(svgNS, "svg");  
			svgNode.setAttributeNS(null,"height","50");
			svgNode.setAttributeNS(null,"width","310");
			svgNode.setAttributeNS(null,"cursor","pointer");
			
			var myIconPath = document.createElementNS(svgNS,"path");
			myIconPath.setAttributeNS(null,"class","jimu-widget-geochat-setting chat-person");
			myIconPath.setAttributeNS(null,"x","20");
			myIconPath.setAttributeNS(null,"y","20");
			myIconPath.setAttributeNS(null,"d",this.personIconPath);
			myIconPath.setAttributeNS(null,"fill","rgb(" + colorRed + ", " + colorGreen + ", " + colorBlue +")");
			myIconPath.setAttributeNS(null,"transform","scale(1.2)");
			myIconPath.setAttributeNS(null,"chat-nickname",client.nickname);
			myIconPath.onclick = this.onClickChatIcon.bind(this);
			svgNode.appendChild(myIconPath);
			
			var myNickName = document.createElementNS(svgNS,"text");
			myNickName.setAttributeNS(null,"x","40");
			myNickName.setAttributeNS(null,"y","25");
			myNickName.setAttributeNS(null,"font-size","18");
			myNickName.setAttributeNS(null,"chat-nickname",client.nickname);
			myNickName.setAttributeNS(null,"chat-setting","name");
			myNickName.textContent = nickname;
			myNickName.onclick = this.onClickClientList.bind(this);
			svgNode.appendChild(myNickName);
			
			var myExtent = document.createElementNS(svgNS,"text");
			myExtent.setAttributeNS(null,"x","40");
			myExtent.setAttributeNS(null,"y","45");
			myExtent.setAttributeNS(null,"chat-nickname",client.nickname);
			myExtent.setAttributeNS(null,"chat-setting","extent");
			myExtent.textContent = "Extent";
			myExtent.onclick = this.onClickClientList.bind(this);
			svgNode.appendChild(myExtent);
			refreshClientSetting(myExtent, client.nickname, client.isMe,
								this.currentClients[client.nickname].shareMyExtent, 
								this.currentClients[client.nickname].shareMyExtent);
			
			var myLocation = document.createElementNS(svgNS,"text");
			myLocation.setAttributeNS(null,"x","90");
			myLocation.setAttributeNS(null,"y","45");
			myLocation.setAttributeNS(null,"chat-nickname",client.nickname);
			myLocation.setAttributeNS(null,"chat-setting","location");
			myLocation.textContent = "Location";
			myLocation.onclick = this.onClickClientList.bind(this);
			svgNode.appendChild(myLocation);
			refreshClientSetting(myLocation, client.nickname, client.isMe,
								this.currentClients[client.nickname].shareMyLocation, 
								this.settingClients[client.nickname].activeLocation);

			var myCursor = document.createElementNS(svgNS,"text");
			myCursor.setAttributeNS(null,"x","150");
			myCursor.setAttributeNS(null,"y","45");
			myCursor.setAttributeNS(null,"chat-nickname",client.nickname);
			myCursor.setAttributeNS(null,"chat-setting","cursor");
			myCursor.textContent = "Cursor";
			myCursor.onclick = this.onClickClientList.bind(this);
			svgNode.appendChild(myCursor);
			refreshClientSetting(myCursor, client.nickname, client.isMe,
								this.currentClients[client.nickname].shareMyCursor, 
								this.settingClients[client.nickname].activeCursor);
			
			var myDrawings = document.createElementNS(svgNS,"text");
			myDrawings.setAttributeNS(null,"x","200");
			myDrawings.setAttributeNS(null,"y","45");
			myDrawings.setAttributeNS(null,"chat-nickname",client.nickname);
			myDrawings.setAttributeNS(null,"chat-setting","drawings");
			myDrawings.textContent = "Drawings";
			myDrawings.onclick = this.onClickClientList.bind(this);
			svgNode.appendChild(myDrawings);
			refreshClientSetting(myDrawings, client.nickname, client.isMe,
								this.currentClients[client.nickname].shareMyDrawings, 
								this.settingClients[client.nickname].activeDrawings);

			var myPlaces = document.createElementNS(svgNS,"text");
			myPlaces.setAttributeNS(null,"x","265");
			myPlaces.setAttributeNS(null,"y","45");
			myPlaces.setAttributeNS(null,"chat-nickname",client.nickname);
			myPlaces.setAttributeNS(null,"chat-setting","places");
			myPlaces.textContent = "Places";
			myPlaces.onclick = this.onClickClientList.bind(this);
			svgNode.appendChild(myPlaces);
			refreshClientSetting(myPlaces, client.nickname, client.isMe,
								this.currentClients[client.nickname].shareMyPlaces, 
								this.settingClients[client.nickname].activePlaces);
			clientNode.appendChild(svgNode);
			clientNode.appendChild(document.createElement("p"));
		}
	  }
	  
		function refreshClientStatus(textItem, status) {
			if(textItem == null)
				return;
			
			if(status == "shared-on"){
				textItem.setAttributeNS(null,"font-size","14");
				textItem.setAttributeNS(null,"font-size","14");
				textItem.setAttributeNS(null,"style","text-decoration: underline;");
				textItem.setAttributeNS(null,"stroke-width","0");
				textItem.setAttributeNS(null,"fill","rgb(0,0,0)");
			}
			else if(status == "shared-off"){
				textItem.setAttributeNS(null,"font-size","14");
				textItem.setAttributeNS(null,"style","text-decoration: underline;");
				textItem.setAttributeNS(null,"stroke-width","0");
				textItem.setAttributeNS(null,"fill","rgb(200,200,200)");
			} 
			else if(status == "not-shared"){
				textItem.setAttributeNS(null,"font-size","14");
				textItem.setAttributeNS(null,"stroke-width","0");
				textItem.setAttributeNS(null,"fill","rgb(255,255,255)");
			}
			else if(status == "me"){
				textItem.setAttributeNS(null,"font-size","14");
				textItem.setAttributeNS(null,"stroke-width","0");
				textItem.setAttributeNS(null,"fill","rgb(255,255,255)");
			}
		}
	
		function refreshClientSetting(textItem, nickname, isMe, isShared, isActive) {
			if(isMe) {
				refreshClientStatus(textItem, "me");
				return;
			}
			if(isShared) {
				if(isActive)
					refreshClientStatus(textItem, "shared-on");
				else
					refreshClientStatus(textItem, "shared-off");
			}else {
				refreshClientStatus(textItem, "not-shared");
			}
		}
	},
		
    connect: function(){
		//local copy of class methods/variables
		var nickname = this.userName.get("value");
		var serverDisplayName = this.serverDisplayName;
		
		//Connect to the chat node.js server
		var client_socket = io.connect(this.serverAddress);
		this.socket = client_socket;
		this.nickname = nickname;
		var clientId = this.clientId;
		
		// when the connection is made, the server emiting
		// the 'connect' event
		client_socket.on('connect', function(){
			// firing back the connect event to the server
			// and sending the nickname for the connected client
			client_socket.emit('connect', {
											nickname: nickname,
											colorRed: this.colorRed,
											colorGreen: this.colorGreen,
											colorBlue: this.colorBlue,
											colorAlpha: this.colorAlpha,
											shareMyExtent: this.shareMyExtent.checked,
											shareMyLocation: this.shareMyLocation.checked,
											shareMyCursor: this.shareMyCursor.checked,
											shareMyDrawings: false,
											shareMyPlaces: false
											//shareMyDrawings: this.shareMyDrawings.checked,
											//shareMyPlaces: this.shareMyPlaces.checked
											});
		}.bind(this));
		
		// after the server created a client for us, the ready event
		// is fired in the server with our clientId, now we can start 
		client_socket.on('ready', function(data){
			 // saving the clientId localy
			clientId = data.clientId;
		}.bind(this));

		// after the initialize, the server sends a list of
		// all the active rooms
		client_socket.on('roomslist', function(data){
			for(var i = 0, len = data.rooms.length; i < len; i++){
				// in socket.io, their is always one default room
				// without a name (empty string), every socket is automaticaly
				// joined to this room, however, we don't want this room to be
				// displayed in the rooms list
				if(data.rooms[i] != ''){
					this.addRoom(data.rooms[i], this.chatRooms);
				}
			}
		}.bind(this));

		// when someone sends a message, the sever push it to
		// our client through this event with a relevant data
		client_socket.on('chatmessage', function(data){
			var nickname = data.client.nickname;
			var message = data.message;
			
			if(message.type=="text"){
				this.addChatText(nickname, message.content);
			}
			else if(message.type=="update-cursor"){
				var client = this.currentClients[nickname];
				var colorRed = client.colorRed;
				var colorGreen = client.colorGreen;
				var colorBlue = client.colorBlue;
				
				if(this.settingClients[nickname].activeCursor){
					var mapPoint = message.content;
					var graphic = new Graphic(new Point([mapPoint.x, mapPoint.y], mapPoint.spatialReference));
					graphic.setAttributes( {"client_id":"1", "client_color": "rgb(" + colorRed + ", " + colorGreen + ", " + colorBlue +")"});
					
					var textGraphic = this.createShareText(new Point([mapPoint.x, mapPoint.y], mapPoint.spatialReference), nickname + "'s Cursor", null);			
			
					if(client.lastReceiveMouseGraphic !=null)
						this.shareGraphicLayer.remove(client.lastReceiveMouseGraphic);
					if(client.lastReceiveMouseText !=null)
						this.shareTextLayer.remove(client.lastReceiveMouseText);
					
					this.shareGraphicLayer.add(graphic);
					this.shareTextLayer.add(textGraphic);	
					client.lastReceiveMouseGraphic = graphic;
					client.lastReceiveMouseText = textGraphic;
				}
				
				if(!client.shareMyCursor){
					client.shareMyCursor = true;
					this.refreshClientList();
				}				
			}
			else if(message.type=="remove-cursor"){
				var client = this.currentClients[nickname];
				if(client.lastReceiveMouseGraphic !=null)
					this.shareGraphicLayer.remove(client.lastReceiveMouseGraphic);
				if(client.lastReceiveMouseText !=null)
					this.shareTextLayer.remove(client.lastReceiveMouseText);
				client.lastReceiveMouseGraphic = null;
				client.lastReceiveMouseText = null;
				
				if(client.shareMyCursor){
					client.shareMyCursor = false;
					this.refreshClientList();
				}				
			}
			else if(message.type=="update-location"){
				var client = this.currentClients[nickname];
				var colorRed = client.colorRed;
				var colorGreen = client.colorGreen;
				var colorBlue = client.colorBlue;
				
				if(this.settingClients[nickname].activeLocation){
					var mapPoint = message.content;
					var graphic = new Graphic(new Point([mapPoint.longitude, mapPoint.latitude]));
					graphic.setAttributes( {"client_id":"0", "client_color": "rgb(" + colorRed + ", " + colorGreen + ", " + colorBlue +")"});
					
					var textGraphic = this.createShareText(new Point([mapPoint.longitude, mapPoint.latitude]), nickname, null);		
					
					if(client.lastLocationGraphic !=null)
						this.shareGraphicLayer.remove(client.lastLocationGraphic);
					if(client.lastLocationText !=null)
						this.shareTextLayer.remove(client.lastLocationText);
					
					this.shareGraphicLayer.add(graphic);
					this.shareTextLayer.add(textGraphic);
					client.lastLocationGraphic = graphic;
					client.lastLocationText = textGraphic;
				}
				
				if(!client.shareMyLocation){
					client.shareMyLocation = true;
					this.refreshClientList();
				}
			}
			else if(message.type=="remove-location"){
				var client = this.currentClients[nickname];
				if(client.lastLocationGraphic !=null)
					this.shareGraphicLayer.remove(client.lastLocationGraphic);
				if(client.lastLocationText !=null)
					this.shareTextLayer.remove(client.lastLocationText);
				client.lastLocationGraphic = null;
				client.lastLocationText = null;
				
				if(client.shareMyLocation){
					client.shareMyLocation = false;
					this.refreshClientList();
				}
			}
			else if(message.type=="update-extent"){
				var client = this.currentClients[nickname];
				var jsonExtent = message.content;
				var extent = new Extent(jsonExtent);
				client.lastUpdatedExtent = extent;
				currentSelfExtent = this.map.extent;
				
				if(!client.shareMyExtent)
					client.shareMyExtent = true;
				
				this.map.setExtent(extent, false);
				this.shareMyExtent.set("checked", false);
				this.refreshClientList();
			}
			else if(message.type=="remove-extent"){
				var client = this.currentClients[nickname];
				this.map.setExtent(this.currentSelfExtent, false);
				if(client.shareMyExtent){
					client.shareMyExtent = false;
					this.refreshClientList();
				}
			}
			else if(message.type=="update-profile"){
				var client = this.currentClients[nickname];
				var userProfile = message.content;
				
				if(client != null && client != undefined){
					client.colorRed = userProfile.colorRed;
					client.colorGreen = userProfile.colorGreen;
					client.colorBlue = userProfile.colorBlue;
					client.colorAlpha = userProfile.colorAlpha;
					client.shareMyExtent = userProfile.shareMyExtent;
					client.shareMyLocation = userProfile.shareMyLocation;
					client.shareMyCursor = userProfile.shareMyCursor;
					client.shareMyDrawings = userProfile.shareMyDrawings;
					client.shareMyPlaces = userProfile.shareMyPlaces;
					this.refreshClientList();
				}
			}
		}.bind(this));
		
		// when we subscribes to a room, the server sends a list
		// with the clients in this room
		client_socket.on('roomclients', function(data){
			
			// add the room name to the rooms list
			this.addRoom(data.room, this.chatRooms);

			// set the current room
			this.setCurrentRoom(data.room);
			
			// announce a welcome message
			//this.addChatText(serverDisplayName, 'Welcome to ' + data.room + ', enjoy!');
			
			// add the myself to the clients list
			this.addClient({ 
							isMe: 	  true,
							nickname: nickname, 
							clientId: clientId,
							colorRed: this.colorRed,
							colorGreen: this.colorGreen,
							colorBlue: this.colorBlue,
							colorAlpha: this.colorAlpha,
							shareMyExtent: this.shareMyExtent.checked,
							shareMyLocation: this.shareMyLocation.checked,
							shareMyCursor: this.shareMyCursor.checked,
							shareMyDrawings: false,
							shareMyPlaces: false
							//shareMyDrawings: this.shareMyDrawings.checked,
							//shareMyPlaces: this.shareMyPlaces.checked
							}, true);
			
			// add the others to the clients list
			for(var i = 0, len = data.clients.length; i < len; i++){
				if(data.clients[i]){
					data.clients[i].colorRed = 0;
					data.clients[i].colorGreen = 0;
					data.clients[i].colorBlue = 0;
					this.addClient(data.clients[i], false);
				}
			}
			
			//refresh the list (GUI)
			this.refreshClientList();
		}.bind(this));
		
		// if someone creates a room the server updates us
		// about it
		client_socket.on('addroom', function(data){
			this.addRoom(data.room, this.chatRooms);
		}.bind(this));
		
		// if one of the room is empty from clients, the server,
		// destroys it and updates us
		client_socket.on('removeroom', function(data){
			this.removeRoom(data.room, this.chatRooms);
		}.bind(this));
		
		// with this event the server tells us when a client
		// is connected or disconnected to the current room
		client_socket.on('presence', function(data){
			if(data.state == 'online'){
				//add the new client to the list
				this.addClient(data.client, false);
				//send my updates to the new client
				//1-User Profile Info
				var userProfile = { 
							colorRed: this.colorRed,
							colorGreen: this.colorGreen,
							colorBlue: this.colorBlue,
							colorAlpha: this.colorAlpha,
							shareMyExtent: this.shareMyExtent.checked,
							shareMyLocation: this.shareMyLocation.checked,
							shareMyCursor: this.shareMyCursor.checked,
							shareMyDrawings: false,
							shareMyPlaces: false
				};
				if(this.socket != null) {
					this.socket.emit('chatmessage', { message: {type: "update-profile", content: userProfile}, room: this.currentRoom });
				}
				//2-Extent
				var currentExtent = this.map.extent;
				var jsonExtent = currentExtent.toJson();
				this.currentSelfExtent = currentExtent;
				if(this.shareMyExtent.checked && this.socket != null) {
					this.socket.emit('chatmessage', { message: {type: "update-extent", content: jsonExtent}, room: this.currentRoom });
				}
				//3-Cursor
				//Do not need to update due to mouse move updating frequently 
				//3-Location
				//Do not need to update due to timer updating frequently
				
			} else if(data.state == 'offline'){
				this.removeClient(data.client);
			}
			//refresh the list (GUI)
			this.refreshClientList();
		}.bind(this));
		
		//Diable repeating connecting
		this.connectButton.set("label", "Disconnect");
		this.connectButton.set("disabled", true);
		this.userName.set("disabled", true);
		this.confID.set("disabled", true);

		this.autoExtent.set("disabled", false);
		this.currentExtent.set("disabled", false);
		this.shareMyExtent.set("disabled", false);
		this.shareMyLocation.set("disabled", false);
		this.shareMyCursor.set("disabled", false);
		this.iputText.set("disabled", false);
    },	

    onOpen: function(){
      console.log('onOpen');
    },

    onClose: function(){
      console.log('onClose');
    },

    onMinimize: function(){
      console.log('onMinimize');
    },

    onMaximize: function(){
      console.log('onMaximize');
    },

    onSignIn: function(credential){
      /* jshint unused:false*/
      console.log('onSignIn');
    },

    onSignOut: function(){
      console.log('onSignOut');
    }
  });
});