define([
    'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/date/locale',
	'dojo/dom',
	'dojo/dom-construct',
	'dojo/dom-style',
	'dojo/number',
	'dojo/on',
	'dojo/promise/all',
	'dojox/xml/parser',
    'dijit/TitlePane',
    'dijit/layout/ContentPane',
    'dijit/layout/TabContainer',
	'esri/Color',
	'esri/geometry/Circle',
	'esri/geometry/Extent',
	'esri/graphic',
	'esri/request',
	'esri/SpatialReference',
	'esri/tasks/GeometryService',
	'esri/tasks/ProjectParameters',
	'esri/tasks/query',
    'jimu/BaseWidget',
	'dijit/_TemplatedMixin',
	'dijit/_WidgetsInTemplateMixin',
	'dijit/form/CheckBox'
  ],
  function(declare,
    lang, dateLocale, dom, domConstruct, domStyle, number, on, all, xmlParser, TitlePane, ContentPane, TabContainer, Color, Circle, Extent, Graphic, esriRequest, SpatialReference, GeometryService, ProjectParameters, Query, BaseWidget, _TemplatedMixin, _WidgetsInTemplateMixin) {
    return declare([BaseWidget, _TemplatedMixin, _WidgetsInTemplateMixin], {
      name: 'IdentificacionAvanzada',
      baseClass: 'jimu-widget-identificacionavanzada',
	  _identificacionHabilitada: true,
	  _ultimaIdentificacionHabilitada: true,
	  _resultadosIdentificacion: null,
	  _geomIdentificacionPologonos: null,
	  _geomIdentificacionPuntosLineas: null,
	  _capabilitiesWFSCatastro: null,
	  _geometryService: new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"),
	  _paramsInfoCatastro: {"cmunicipio": "", "cpoligono": "", "cparcela": "", "url": ""},
	  _aGraphicsActualSel: [],
	  
	  postCreate: function() {
	    this.inherited(arguments);
        this._init();		
	  },

      startup: function() {
        this.inherited(arguments);
		if (!this.config.interfazUsuario.mostrarTitulo)
			this.tituloWidget.style.display = 'none';
      },

      _init: function() {
	    this._initUI();
		this._configurarCapasAIdentificar();
		this.own(on(this.map, "click", lang.hitch(this, this.onClickMapa)));
		this._getCapabilitiesWFSCatastro(this.config.informacionCatastro.servicioWFS);
		//console.log("FIN _init");
      },
  
	  _initUI: function() {
		//this.seccionResultadoIdentificacion.style.display = 'none';
		if (!this.config.interfazUsuario.mostrarCheckBoxHabitilarIdentificacion) {
			this.checkIdentificar.domNode.style.display = 'none';
			this.labelCheckIdentificar.style.display = 'none';
		}
		this.own(on(this.enlaceEliminarResaltadoActual, "click", lang.hitch(this, this.onClickEnlaceEliminarResaltadoActual)));
		this.checkIdentificar.set("checked", true);
		this.own(on(this.checkIdentificar, "change", lang.hitch(this, function (isChecked) {
                this._identificacionHabilitada = isChecked ? true : false;
				if (isChecked)
					this.labelCheckIdentificar.innerHTML = this.nls.identificacionHabilitada;
				else
					this.labelCheckIdentificar.innerHTML = this.nls.identificacionDeshabilitada;
            })));
		var divMensajeInicial = this._creaDiv("divMensajeInicial", this.nls.mensajeInicial, "mensajeInicial");
		this.resultadoIdentificacion.appendChild(divMensajeInicial);
	  },
	  
	  _configurarCapasAIdentificar: function() {
		this._querysFeatureLayers = [];
		var operationalLayer = null;
		var query;
		for (var i = 0; i < this.config.serviciosAIdentificar.length; i++) {
			operationalLayer = this._buscarOperationalLayer(this.map.itemInfo.itemData.operationalLayers, this.config.serviciosAIdentificar[i].idWebMap);
			if (operationalLayer != null) {
				var campoObjectId = operationalLayer.objectIdField;
				if (!this._hayCampoObjectId(this.config.serviciosAIdentificar[i].camposServicio, campoObjectId))
					this.config.serviciosAIdentificar[i].camposServicio.push(campoObjectId);
				this.config.serviciosAIdentificar[i].layer = operationalLayer;
				query = new Query();
				query.outFields = this.config.serviciosAIdentificar[i].camposServicio;
				this._querysFeatureLayers.push(query);
			} else {
				console.log("Capa " + this.config.serviciosAIdentificar[i].id + " (" + this.config.serviciosAIdentificar[i].url + ") no encontrada en el WebMap");
			}
		}
	  },
	  
	  _buscarOperationalLayer: function(operationalLayers, idWebMap) {
		var layer = null;
		var i = 0;
		while ((i < operationalLayers.length) && (layer == null)) {
			if (operationalLayers[i].id === idWebMap) {
				layer = operationalLayers[i].layerObject;
				layer.title = operationalLayers[i].title;
			}
			i++;
		}
		
		return layer;
	  },
	  
	  _hayCampoObjectId: function(camposServicio, campoObjectId) {
		var hay = camposServicio[0].trim() === "*";
		if (!hay) {
			var i = 0;
			while ((i < camposServicio.length) && !hay) {
				hay = camposServicio[i] === campoObjectId;
				i++;
			}
		}
		
		return hay;
	  },
	  
      _deshabilitarWebMapPopup: function() {
		try {
			this.map.infoWindow.hide();
			setTimeout(lang.hitch(this, function () {
				this.map.setInfoWindowOnClick(false);
			}), 500);
		} catch(err) {
			console.log("Error al deshabilitar WebMapPopup: " + err.message);
		}
      },

      _habilitarWebMapPopup: function() {
        this.map.setInfoWindowOnClick(true);
      },

      /*******************************
       * Metodos para el control del popup
       *******************************/
      onActive: function(){
      },

      onDeActive: function(){
      },

      /*************************
       * Eventos del Widget
       ************************/
      _update: function() {
      },

      resize: function() {
        this._update();
      },

      onOpen: function() {
		console.log("onOpen");
		this._deshabilitarWebMapPopup();
		this._identificacionHabilitada = this._ultimaIdentificacionHabilitada;
		this.checkIdentificar.set("checked", this._ultimaIdentificacionHabilitada);
      },

      onClose: function() {
		console.log("onClose");
		this._habilitarWebMapPopup();
		this._ultimaIdentificacionHabilitada = this._identificacionHabilitada;
		this._identificacionHabilitada = false;
      },

      onNormalize: function(){
        setTimeout(lang.hitch(this, this._update), 100);
      },

      onMinimize: function(){
      },

      onMaximize: function(){
        setTimeout(lang.hitch(this, this._update), 100);
      },
	  
      /*************************
       * Otros eventos del Widget
       ************************/
	  onClickMapa: function(evento) {
		if (!this._identificacionHabilitada)
			return;
		
		setTimeout(lang.hitch(this, function () {
			this._deshabilitarWebMapPopup();
		}), 100);

		this.seccionResultadoIdentificacion.style.display = 'none';
		this._resultadosIdentificacion = null;
		if (this._aGraphicsActualSel.length > 0)
			this._borrarGeometriasSeleccionadas();
		
		var circulo = new Circle({
            center: evento.mapPoint,
            geodesic: true,
            radius: this.config.radioIdentificacionPoligonos,
            radiusUnit: "esriMeters"
        });
		this._geomIdentificacionPologonos = circulo.getExtent();
		this._geomIdentificacionCatastro = this._geomIdentificacionPologonos;
		/*
		circulo = new Circle({
            center: evento.mapPoint,
            geodesic: true,
            radius: this.config.radioIdentificacionPuntosLineas,
            radiusUnit: "esriMeters"
        });
		this._geomIdentificacionPuntosLineas = circulo.getExtent();
		*/
		var pxWidth = this.map.extent.getWidth() / this.map.width;
		var padding = this.config.factorPaddingIdentificacionPuntosLineas * pxWidth;
		this._geomIdentificacionPuntosLineas = new Extent({
			"xmin": evento.mapPoint.x - padding,
			"ymin": evento.mapPoint.y - padding,
			"xmax": evento.mapPoint.x + padding,
			"ymax": evento.mapPoint.y + padding,
			"spatialReference": this.map.spatialReference
		});

		var deferredsQuerys = [];
		var query;
		for (var i = 0; i < this.config.serviciosAIdentificar.length; i++) {		
			query = this._querysFeatureLayers[i];
			if (this.config.serviciosAIdentificar[i].layer.geometryType === "esriGeometryPolygon")
				query.geometry = this._geomIdentificacionPologonos;
			else
				query.geometry = this._geomIdentificacionPuntosLineas;
			this.config.serviciosAIdentificar[i].layer.clearSelection();
			deferredsQuerys.push(this.config.serviciosAIdentificar[i].layer.queryFeatures(query));
		}
		
		var promises = all(deferredsQuerys);
		promises.then(lang.hitch(this, this._gestionarResultadosQuerys));
	  },
	  
	  onClickZoom: function(feature) {
		if (feature.geometry.type === "point") {
			this.map.centerAndZoom(feature.geometry, this.map.getMaxZoom() - this.config.ajusteZoomPunto);
		}
		else {
			this.map.setExtent(feature.geometry.getExtent().expand(this.config.factorZoomPoligono));
		}
	  },
	  
	  onClickEnlaceResaltar: function(feature) {
		//alert("Resaltar feature");
		if (this._aGraphicsActualSel.length > 0)
			this._borrarGeometriasSeleccionadas();
		
		this._resaltarGeometria(feature.geometry);
	  },
	  
	  onClickEnlaceEliminarResaltadoActual: function(evento) {
		if (this._aGraphicsActualSel.length > 0)
			this._borrarGeometriasSeleccionadas();
	  },
	  
	  onClickImagen: function(evento) {
		var divAux = domConstruct.create("div", { id: "overlayImgAmpliada", class: "overlayImgAmpliada"} );
		var divContenedorImgAmpliada = domConstruct.create("div", { id: "divContenedorImgAmpliada", class: "divContenedorImgAmpliada" });
		var imagen = domConstruct.create("img", { id: "imagenAmpliada", src: evento.currentTarget.src, alt: evento.currentTarget.alt, class: "imgAmpliada" } );
		var maxWidth = (document.body.clientWidth * 0.95) + 'px';
		domStyle.set(imagen, "max-width", maxWidth);
		var divAux2 = domConstruct.create("div", { class: "divCerrarImgAmpliada" });
		on(divAux2, "click", lang.hitch(this, this.onClickCerrarImgAmpliada))
		divContenedorImgAmpliada.appendChild(divAux2);
		divAux2 = domConstruct.create("div", { class: "divImgAmpliada" });
		divAux2.appendChild(imagen);
		divContenedorImgAmpliada.appendChild(divAux2);
		document.body.appendChild(divAux);
		document.body.appendChild(divContenedorImgAmpliada);
	  },

	  onClickCerrarImgAmpliada: function(evento) {
		domConstruct.destroy("divContenedorImgAmpliada");
		domConstruct.destroy("overlayImgAmpliada");
	  },
	  
      /*************************
       * Otras funciones
       ************************/
	  _buscarServicioAIdentificar: function(idServicio) {
		var servicio = null;
		var i = 0;
		while ( (i < this.config.serviciosAIdentificar.length) && (servicio == null) ) {
			if (this.config.serviciosAIdentificar[i].id === idServicio)
				servicio = this.config.serviciosAIdentificar[i];
			i++;
		}
		
		return servicio;
	  },
	  
	  _gestionarResultadosQuerys: function(resultados) {
		this._resultadosIdentificacion = new Object();
		
		for (var i = 0; i < this.config.serviciosAIdentificar.length; i++) {		
			this._resultadosIdentificacion[this.config.serviciosAIdentificar[i].layer.id] = resultados[i];
		}
		
		this._mostrarResultados();
	  },

	  _mostrarResultados: function() {
		this.resultadoIdentificacion.innerHTML = '';
		
		// TODO: ¿ALmacenar los widgets TitlePane creados y eliminarlos antes de mostrar un nuevo resultado?
		for (var i = 0; i < this.config.interfazUsuario.paneles.length; i++) {
			var panel = this.config.interfazUsuario.paneles[i];
			var divContenidoPanel = document.createElement("div");
			
			var tp = new TitlePane({title: panel.titulo, content: divContenidoPanel});
			this._mostrarContenidoPanel(panel, divContenidoPanel);
			this.resultadoIdentificacion.appendChild(tp.domNode);
			tp.startup();
			
			if (!panel.abiertoInicialmente && tp.open) {
				tp.toggle(); 
			} 
		}

		this.seccionResultadoIdentificacion.style.display = 'block';
	  },

	  _mostrarContenidoPanel: function(panel, divContenidoPanel) {
		for (var s = 0; s < panel.serviciosGIS.length; s++) {
			var servicioGISPanel = panel.serviciosGIS[s];
			var divContenidoServicio = document.createElement("div");
			var servicioGIS = this._buscarServicioAIdentificar(servicioGISPanel.id);
			var resultadoCapa = this._resultadosIdentificacion[servicioGIS.layer.id];
			var titulo = lang.replace(this.nls.tituloPanelResultadoServicio, {titulo: servicioGIS.layer.title, numfeatures: resultadoCapa.features.length});
			var tp = new TitlePane({title: titulo, content: divContenidoServicio});
			var layer = null;
			var infoCampo = null;
			var tieneImagenes = (servicioGISPanel.hasOwnProperty("tieneImagenes") && servicioGISPanel.tieneImagenes);
			var informacionCatastroAsociada = (servicioGISPanel.hasOwnProperty("informacionCatastroAsociada") && servicioGISPanel.informacionCatastroAsociada);

			for (var f = 0; f < resultadoCapa.features.length; f++) {
				var strTabla = "<table class='TFtable'><tbody>";
				var feature = resultadoCapa.features[f];
				if (layer === null)
					layer = feature.getLayer();
				var objectId = feature.attributes[layer.objectIdField];
					
				for (var c = 0; c < servicioGISPanel.campos.length; c++) {
					var campo = servicioGISPanel.campos[c];
					infoCampo = this._buscarInfoCampo(layer, campo.campo);
					strTabla += this._rellenarValorCampo(feature, infoCampo, campo);
				}
				strTabla += "</tbody></table>";
				
				var elementAux = this._creaDiv("tabla-" + panel.titulo + "-" + servicioGIS.layer.name + "-" + objectId, strTabla, "tablaDinamica");
				var divAux = domConstruct.create("div", { id: "imagenes-" + panel.titulo + "-" + servicioGIS.layer.name + "-" + objectId, class: "divImagenes" , style: "display: none"} );
				elementAux.appendChild(divAux);
				divAux = domConstruct.create("div", { class: "divEnlaceZoomResaltar" } );
				var enlaceAux = domConstruct.create("a", { href: "javascript:void(0);", title: this.nls.zoomFeature, innerHTML: this.nls.zoomFeature, class: "enlaceZoom" }, divAux);
				on(enlaceAux, "click", lang.hitch(this, this.onClickZoom, feature));
				enlaceAux = domConstruct.create("a", { href: "javascript:void(0);", title: this.nls.resaltarFeature, innerHTML: this.nls.resaltarFeature, class: "enlaceResaltar" }, divAux);
				on(enlaceAux, "click", lang.hitch(this, this.onClickEnlaceResaltar, feature));
				if (servicioGISPanel.resaltarTodos)
					this._resaltarGeometria(feature.geometry);
				elementAux.appendChild(divAux);
				
				var innerContentDiv = document.createElement("div");
				innerContentDiv.id = "divTabla_" + panel.titulo + "-" + servicioGIS.layer.name + "-" + objectId;
				innerContentDiv.appendChild(elementAux);

				divContenidoServicio.appendChild(innerContentDiv);
				
				var _self = this;
				if (tieneImagenes) {
					layer.queryAttachmentInfos(objectId,
						lang.hitch(servicioGIS.layer, function (adjuntos) {
							if (adjuntos.length > 0) {
								var divImagenes = dom.byId("imagenes-" + panel.titulo + "-" + this.name + "-" + adjuntos[0].objectId);
								for (var i = 0; i < adjuntos.length; i++) {
									var imagen = domConstruct.create("img", { src: adjuntos[i].url, alt: adjuntos[i].name, class: "imagen" } );
									on(imagen, "click", lang.hitch(_self, _self.onClickImagen));
									divImagenes.appendChild(imagen);
								}
								divImagenes.style.display = "block";
							}
						}),
						lang.hitch(this, function (error) {
							console.log("Error al consultar imagen adjunta");
						}));
				}
			}

			if (informacionCatastroAsociada) {
				this._mostrarInformacionCatastro();
				var contenidoAux = "<div class='obteniendoInfoCatastro'>" + this.nls.obteniendoInfoCatastro + "</div>";
				this._divInfoCatastro = this._creaDiv("divInfoCat-" + panel.titulo, contenidoAux, "infoCatastro");
				divContenidoServicio.appendChild(this._divInfoCatastro);
			}
				
			divContenidoPanel.appendChild(tp.domNode);
			tp.startup();
		}
	  },
	  
	  _rellenarValorCampo: function(feature, infoCampo, campo) {
		var fila;
		
		var valor = this._obtenerValorCampo(feature, infoCampo, campo);
		fila = "<tr><td>" + infoCampo.alias + "</td><td>" + valor + "</td></tr>";
		
		return fila;
	  },
	  
	  _buscarInfoCampo: function(layer, nombreCampo) {
		var infoCampo = null;
		
		var i = 0;
		while ( (i < layer.fields.length) && (infoCampo == null) ) {
			if (layer.fields[i].name === nombreCampo)
				infoCampo = layer.fields[i];
		
			i++;
		}
		
		return infoCampo;
	  },
	  
	  _obtenerValorCampo: function(feature, infoCampo, campo) {
		var valor = feature.attributes[campo.campo];
		var layer = feature.getLayer();
		
		if ( (valor !== null) && (campo.hasOwnProperty('formato')) ) {
			if (infoCampo.type === "esriFieldTypeDate") {
				var fecha  = new Date(valor);
				valor = dateLocale.format(fecha, { datePattern : campo.formato, selector : 'date'});
			} 
			else if (infoCampo.type === "esriFieldTypeDouble" ||
				infoCampo.type === "esriFieldTypeSingle" ||
				infoCampo.type === "esriFieldTypeInteger" ||
				infoCampo.type === "esriFieldTypeSmallInteger")
				valor = number.format(valor, campo.formato);
			else if (infoCampo.type === "esriFieldTypeString" && campo.formato === "link") {
				var link = domConstruct.create("a", { href: valor, target: "_blank", title: this.nls.verEnlaceValorCampo, innerHTML: this.nls.verEnlaceValorCampo, class: "enlaceValorCampo" });
				valor = link.outerHTML;
			}
		}
		else if (valor === null)
			valor = this.config.interfazUsuario.textoValorNull;
		
		return valor;
	  },
	  
	  _mostrarInformacionCatastro: function() {
		this._paramsInfoCatastro = {"cmunicipio": "", "cpoligono": "", "cparcela": "", "url": ""};
		this._capaCatastroActual = this.config.informacionCatastro.capasWFSParcelas[0];
		this._obtenerInfoCatastro(this.config.informacionCatastro.servicioWFS, this._capaCatastroActual);
	  },
	  
	  _obtenerInfoCatastro: function(url, capa) {
          this._crearBBOX(url, capa);
	  },
	  
	  _crearBBOX: function(url, capa) {
		if (this._geomIdentificacionCatastro.spatialReference.wkid != this.config.informacionCatastro.sistemaReferencia) {
			var parametros = new ProjectParameters();
			parametros.geometries = [this._geomIdentificacionCatastro];
			parametros.outSR = new SpatialReference(this.config.informacionCatastro.sistemaReferencia);
			
			this._geometryService.project(parametros,
				lang.hitch(this, function (geometries) {
					this._geomIdentificacionCatastro = geometries[0];
					var bbox = "" + this._geomIdentificacionCatastro.xmin + "," + this._geomIdentificacionCatastro.ymin + "," + this._geomIdentificacionCatastro.xmax + "," + this._geomIdentificacionCatastro.ymax;
					this._obtenerInfoCatastroAux(url, capa, bbox);
				}),
				function (error) {
					console.log("ERROR al proyectar BBOX: " + error);
				});
		} else {
			var bbox = "" + this._geomIdentificacionCatastro.xmin + "," + this._geomIdentificacionCatastro.ymin + "," + this._geomIdentificacionCatastro.xmax + "," + this._geomIdentificacionCatastro.ymax;
			this._obtenerInfoCatastroAux(url, capa, bbox);
		}
	  },
	  
	  _obtenerInfoCatastroAux: function(url, capa, bbox) {
  		  if (this._capabilitiesWFSCatastro === null)
			this._capabilitiesWFSCatastro = {version: "2.0.0"}

          var requestHandle = esriRequest({
			"url": url,
			"content": {
				"service": "WFS",
				"version": this._capabilitiesWFSCatastro.version,
				"request": "GetFeature",
				"typeNames": capa,
				"srsName": this.config.informacionCatastro.crs,
				"bbox": bbox
			},
            "handleAs": "xml"
          });
          requestHandle.then(lang.hitch(this, function(response, io) {
			  var xml = xmlParser.innerXML(response);
			  var domXml = xmlParser.parse(xml);
			  var fc = domXml.children[0];
			  var member = fc.children[1];
			  if ( (member !== null) && (typeof member !== "undefined") ){
				var im = 1;
				this._divInfoCatastro.innerHTML = "";
				do
				{
					this._paramsInfoCatastro.cmunicipio = member.children[0].children[4].textContent;
					this._paramsInfoCatastro.cpoligono = member.children[0].children[8].textContent;
					this._paramsInfoCatastro.cparcela = member.children[0].children[9].textContent;
					this._paramsInfoCatastro.url = this._buscarURL(member.children[0].children, 10);
					//var strHref = this.config.informacionCatastro.servicioInfoCatastro + 
					//	"?C=" + this._paramsInfoCatastro.cmunicipio + "&PO=" + this._paramsInfoCatastro.cpoligono + "&PA=" + this._paramsInfoCatastro.cparcela + "&lang=" + dojoConfig.locale;
					var strHref = this._paramsInfoCatastro.url + "&amp;lang=" + dojoConfig.locale;
					var divAux = domConstruct.create("div", { class: "divEnlaceInfoCat" } );
					var strTitulo = lang.replace(this.nls.parcelaCatastro, {municipio: this._paramsInfoCatastro.cmunicipio, poligono: this._paramsInfoCatastro.cpoligono, parcela: this._paramsInfoCatastro.cparcela});
					var enlaceInfoCat = domConstruct.create("a", { href: strHref, target: "_blank", title: this.nls.tituloLinkInfoCatastro, innerHTML: strTitulo, class: "enlaceInfoCat" }, divAux);
					this._divInfoCatastro.appendChild(divAux);
					im++;
					member = fc.children[im];
				} while ( (member !== null) && (typeof member !== "undefined") );
			  } else {
				var capa = null;
				var i = 0;
				while ( (i < this.config.informacionCatastro.capasWFSParcelas.length) && (capa === null) ) {
					if ( (this._capaCatastroActual === this.config.informacionCatastro.capasWFSParcelas[i]) &&
						 (i + 1 < this.config.informacionCatastro.capasWFSParcelas.length) )
						capa = this.config.informacionCatastro.capasWFSParcelas[i + 1];
						
					i++;
				}
				
				if (capa !== null) {
					this._capaCatastroActual = capa;
					this._obtenerInfoCatastro(this.config.informacionCatastro.servicioWFS, this._capaCatastroActual);
				} else {
					var contenidoAux = "<div class='sinInfoCatastro'>" + this.nls.sinInfoCatastro + "</div>";
					this._divInfoCatastro.innerHTML = contenidoAux;
				}
			  }
		  }), lang.hitch(this, this._errorRequest));
	  },
	  
	  _resaltarGeometria: function (geometry) {
		var graphicSel;
		
		if (geometry.type === "polyline")
			graphicSel = new Graphic(geometry, this.map.infoWindow.lineSymbol);
		else if (geometry.type === "polygon")
			graphicSel = new Graphic(geometry, this.map.infoWindow.fillSymbol); //new Graphic(feature.geometry, this._simboloResPoligono);
		else
			graphicSel = new Graphic(geometry, this.map.infoWindow.markerSymbol);
		
		this.map.graphics.add(graphicSel);
		this._aGraphicsActualSel.push(graphicSel);
	  },

	  _borrarGeometriasSeleccionadas: function () {
		for (var i = 0; i < this._aGraphicsActualSel.length; i++) {
			this.map.graphics.remove(this._aGraphicsActualSel[i]);
		}
	  },
	  
	  _buscarURL: function(children, inicio) {
		var url = null;
		
		var i = inicio;
		while ( (i < children.length) && (url === null) ) {
			if (children[i].tagName.toUpperCase() === "IDENA:URL")
				url = children[i].textContent;
			i++;
		}
		
		return url;
	  },
	  
	  _getCapabilitiesWFSCatastro: function(url) {
		  if (this._capabilitiesWFSCatastro !== null)
			return;

		  try {
			  var requestHandle = esriRequest({
				"url": url,
				"content": {
					"SERVICE": "WFS",
					"REQUEST": "GetCapabilities"
				},
				"handleAs": "xml"
			  });
			  requestHandle.then(lang.hitch(this, function(response, io) {
				  var xml = xmlParser.innerXML(response);
				  var domXml = xmlParser.parse(xml);
				  this._capabilitiesWFSCatastro = new Object();
				  this._capabilitiesWFSCatastro.version = domXml.children[0].attributes.version.textContent;
		  		  console.log("FIN _getCapabilitiesWFSCatastro");
			  }), lang.hitch(this, this._errorGetCapabilitiesWFSCatastro));
		  } catch(err) {
			this._capabilitiesWFSCatastro.version = "2.0.0";
			console.log("Error getCapabilitiesWFSCatastro:" + err.message);
		  }
	  },
	  
	  _errorGetCapabilitiesWFSCatastro: function(error, io){
		  this._capabilitiesWFSCatastro.version = "2.0.0";
		  //domClass.add(dom.byId("content"), "failure");
		  //dom.byId("status").innerHTML = "";

		  dojoJson.toJsonIndentStr = " ";
		  //dom.byId("content").value = dojoJson.toJson(error, true);
		  console.log(dojoJson.toJson(error, true));
	  },
	  
	  _errorRequest: function(error, io){
		  //domClass.add(dom.byId("content"), "failure");
		  //dom.byId("status").innerHTML = "";

		  console.log(error.message);
	  },
	  
	  _creaDiv: function(id, contenido, estilo) {
		var element = document.createElement("div");
		element.setAttribute("class", estilo);
		element.setAttribute("id", id);
		element.innerHTML = contenido;
		return element;
	  }
    });
  });