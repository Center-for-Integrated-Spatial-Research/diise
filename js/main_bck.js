function splashInit() {
	launchTibApp();
	dojo.style("exploreMapHover", {"opacity":"0", "display":"block" });
	dojo.connect(dojo.byId("exploreMap"), "onclick", function(evt) {
		launchTibApp();
	});
	
	var panes = [];
	for (i=0; i<images[random][1]; i++) {
		panes.push({ className: "image", innerHTML: '<img src="images/splash/'+ images[random][0] +'_'+ i +'.jpg">' } );
	}

	new dojox.widget.AutoRotator({
			transition: "dojox.widget.rotator.crossFade",
			transitionParams:"duration:2000",
			duration: 4000,
			pauseOnManualChange: false,
			suspendOnHover: false,
			panes: panes
		},
		dojo.byId("splashRotator")
	);
	dojo.style("splashCenter", "background","url(images/splash/" + images[random][0] + ".jpg) no-repeat");
	dojo.style(dojo.query("body")[0], "overflow", "auto");
	dojo.style(dojo.query("html")[0], "overflow", "auto");	
}

function hoverGoToMap(image) {
	var fadeArgs = { node: "exploreMapHover", duration: 350 };
	if (image == "exploreMapHover") {
		dojo.fadeIn(fadeArgs).play();
	} else {
		dojo.fadeOut(fadeArgs).play();
	}
}

function launchTibApp() {
	var fadeArgs = {
		node: "splashFloater",
		duration: 1000,
		onEnd: function(){
			dojo.destroy("splashOverlay");
			mapInit();
		}
	};
	dojo.fadeOut(fadeArgs).play();
}

function mapInit(){
	dijit.byId("application").resize();
	
	//dijit.byId("searchButton").setDisabled(true);
	//dijit.byId("clearButton").setDisabled(true);
	
	dojo.style("progressBarDiv", { 
			display:"block",
			top: dojo.style("mapDiv", "height")/2 - dojo.style("progressBarDiv", "height")/2 + dojo.style("topDiv", "height")/2 + "px",
			left: dojo.style("mapDiv", "width")/2 - dojo.style("progressBarDiv", "width")/2 + "px"
	});
	
	//turn off map slider labels
	esri.config.defaults.map.sliderLabel = null;
	esri.config.defaults.map.slider = { right:"20px", top:"10px", width:"125px", height:null};
	esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
	esri.config.defaults.io.corsEnabledServers.push(corsServer);
	esri.config.defaults.io.proxyUrl = "/proxy/proxy.ashx"
	
	var popupOptions = {
	  "markerSymbol": new esri.symbol.SimpleMarkerSymbol("circle", 8, null, new dojo.Color([0, 0, 0, 0.25]))
	};
	var popup = new esri.dijit.Popup(popupOptions, dojo.create("div"));
	
	var template = new esri.InfoTemplate();
	template.setTitle("<b>${Island_Name}</b>");
	
	//set initial extent and levels of detail (lods) for map
	initialExtent = new esri.geometry.Extent({
		"xmin": -32169593.472203825,
		"ymin": -7024868.647519005,
		"xmax": -939258.2035679845,
		"ymax": 7611905.0247489195,
		"spatialReference": { "wkid": 102100 } 
	});
	
	var lods = [
      {"level" : 0, "resolution" : 156543.033928, "scale" : 591657527.591555}, 
      {"level" : 1, "resolution" : 78271.5169639999, "scale" : 295828763.795777}, 
      {"level" : 2, "resolution" : 39135.7584820001, "scale" : 147914381.897889},
	  {"level" : 3, "resolution" : 19567.8792409999, "scale" : 73957190.948944}, 
      {"level" : 4, "resolution" : 9783.93962049996, "scale" : 36978595.474472}, 
      {"level" : 5, "resolution" : 4891.96981024998, "scale" : 18489297.737236}, 
      {"level" : 6, "resolution" : 2445.98490512499, "scale" : 9244648.868618}, 
      {"level" : 7, "resolution" : 1222.99245256249, "scale" : 4622324.434309}, 
      {"level" : 8, "resolution" : 611.49622628138, "scale" : 2311162.217155}, 
      {"level" : 9, "resolution" : 305.748113140558, "scale" : 1155581.108577}, 
      {"level" : 10, "resolution" : 152.874056570411, "scale" : 577790.554289}, 
      {"level" : 11, "resolution" : 76.4370282850732, "scale" : 288895.277144}, 
      {"level" : 12, "resolution" : 38.2185141425366, "scale" : 144447.638572}
    ];
	
	map = new esri.Map("mapDiv", {	
		"extent":initialExtent,
		"fitExtent": false,
		"lods": lods,
		"logo": false,
		"fadeOnZoom": true,
		"force3DTransforms": true,
		"navigationMode": "css-transforms",
		"wrapAround180": true,
		"infoWindow": popup,
		"slider": false
	});
	
	ovMapLayer = new esri.layers.ArcGISTiledMapServiceLayer(ovMapLayerUrl,{ id:'ovmap', visible: true });
	map.addLayer(ovMapLayer);
	
	baseMapLayer = new esri.layers.ArcGISTiledMapServiceLayer(baseMapLayerUrl,{id:'basemap'});
	map.addLayer(baseMapLayer);
	
	imageryLayer = new esri.layers.ArcGISTiledMapServiceLayer(imageryLayerUrl,{id:'imagery', visible: false });
	map.addLayer(imageryLayer);
	
	islandPointFeatures = new esri.layers.FeatureLayer(islandPointFeaturesUrl, {
	  id:'islands',
	  mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
	  outFields: islandPointFeaturesFields
	});
	
	islandSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([210,210,210,1]), 1), new dojo.Color([130,130,130,1]));
	
	selectionSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,255,1]), 1), new dojo.Color([194,75,79,1]));
	
	highlightSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([246,247,146,1]), 4), new dojo.Color([194,75,79,1]));
	
	islandPointFeatures.setRenderer(new esri.renderer.SimpleRenderer(islandSymbol));
	islandPointFeatures.setSelectionSymbol(islandSymbol);
	map.addLayer(islandPointFeatures);
	
	islandPointSelectionLayer = new esri.layers.GraphicsLayer({id:'selectionLayer'});
	islandPointSelectionLayer.setRenderer(new esri.renderer.SimpleRenderer(selectionSymbol))
	map.addLayer(islandPointSelectionLayer);
	islandPointSelectionLayer.show();
	
	islandPointHighlightLayer = new esri.layers.GraphicsLayer({id:'highlightLayer'});
	islandPointHighlightLayer.setRenderer(new esri.renderer.SimpleRenderer(highlightSymbol))
	map.addLayer(islandPointHighlightLayer);
	islandPointHighlightLayer.show();	
	
	var query = new esri.tasks.Query();
	query.where = ("1=1");
	query.returnGeometry = true;
	islandPointFeatures.queryFeatures(query, function(results) {
		islandPointFeaturesLayer = results;
		if (!dijit.byId("islandSelect")) {
			var data = filterSelectData(results.features, "Island_Name", ["Country", "Region_ID_Name"], true);
			populateFilterSelect(data, "islandSelect", false, "", "", [{ filter: "countrySelect", link: "Country" },{ filter: "regionSelect", link: "Region_ID_Name" }]);

			dojo.connect(dijit.byId("islandSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("islandSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});			
		}
		
		if (!dijit.byId("countrySelect")) {
			var data = filterSelectData(results.features, "Country", ["Region_ID_Name"], true);
			populateFilterSelect(data, "countrySelect", true, ["islandSelect"], "Country", [{ filter: "regionSelect", link: "Region_ID_Name" }]);

			dojo.connect(dijit.byId("countrySelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("countrySelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});		
		}		

		if (!dijit.byId("regionSelect")) {
			var data = filterSelectData(results.features, "Region_ID_Name", "#", true);
			populateFilterSelect(data, "regionSelect", true, ["islandSelect", "countrySelect"], "Region_ID_Name");
			dojo.connect(dijit.byId("regionSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("regionSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});
		}		
	});	
	
	var queryTask = new esri.tasks.QueryTask(invasiveSppTableUrl);
	var query = new esri.tasks.Query();
	query.where = ("1=1");
	query.outFields = invasiveSppIslandFields;
	queryTask.execute(query, function(results) {
		invasiveSppIslandTable = results;
		if (!dijit.byId("invasiveTypeSelect")) {
			var data = filterSelectData(invasiveSppIslandTable.features, "InvasiveTypeCorrected", "#", true);
			
			var items = [];
			dojo.forEach(invasiveTypeSelectOrder, function(item){
				dojo.some(data.items, function(obj) {
					if (obj.name == item) { items.push(obj); }
				});
			});
			data.items = items;			
			
			populateFilterSelect(data, "invasiveTypeSelect", true, ["invasiveCommonSelect", "invasiveScientificSelect"], "InvasiveTypeCorrected");
			dojo.connect(dijit.byId("invasiveTypeSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("invasiveTypeSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});				
		}
		
		if (!dijit.byId("invasiveScientificSelect")) {
			var data = filterSelectData(invasiveSppIslandTable.features, "Invasive_Scientific", ["InvasiveTypeCorrected", "Invasive_Species"], true);
			populateFilterSelect(data, "invasiveScientificSelect", true, "", "", [{ filter: "invasiveTypeSelect", link: "InvasiveTypeCorrected" }, { filter: "invasiveCommonSelect", link: "Invasive_Species" }]);		
			
			dojo.connect(dijit.byId("invasiveScientificSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("invasiveScientificSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});				
		}
	
		if (!dijit.byId("invasiveCommonSelect")) {
			var data = filterSelectData(invasiveSppIslandTable.features, "Invasive_Species", ["InvasiveTypeCorrected", "Invasive_Scientific"], true);
			populateFilterSelect(data, "invasiveCommonSelect", true, "", "", [{ filter: "invasiveTypeSelect", link: "InvasiveTypeCorrected" }, { filter: "invasiveScientificSelect", link: "Invasive_Scientific" }]);	

			dojo.style("invasiveCommonSelectDiv", "display", "none");
			dojo.connect(dijit.byId("invasiveCommonSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("invasiveCommonSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});				
		}	
	});		
	
	navigationTool = new esri.toolbars.Navigation(map);
	
	dojo.connect(map, "onExtentChange", function(extent, delta, levelChange, lod){
			navigationTool.deactivate();
			dojo.style("mapDiv_layers", "cursor", "default");
			
			/*
			var extent = map.extent;
			var centralMeridian = esri.geometry.webMercatorToGeographic(extent.getCenter()).x;
			console.log("central meridian=" + centralMeridian);
			
			var xmin = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(map.extent.xmin, map.extent.ymin, map.spatialReference)).x
			var xmax = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(map.extent.xmax, map.extent.ymax, map.spatialReference)).x
			console.log("xmin=" + xmin + "; xmax=" + xmax);
			
			var pt3 = esri.geometry.geographicToWebMercator(new esri.geometry.Point(0, 0, new esri.SpatialReference(4326)))
			var pt4 = esri.geometry.geographicToWebMercator(new esri.geometry.Point(1, 1, new esri.SpatialReference(4326)))
			var dist = new esri.geometry.Extent(pt3.x,pt3.y,pt4.x,pt4.y,map.spatialReference).getWidth();
			console.log("distance of one degree longitude (mercator web auxiliary sphere)=" + dist);
			
			console.log("map scale=" + map.getScale());
			
			if ((xmin > 0) && (xmax > 0) && (centralMeridian < 0)) {
				console.log("crosses prime meridian and international dateline");
				var width = ((180 - xmin)*dist) + (xmax*dist) + (180*dist);
				extent = "-" + width/2 + ";" + extent.ymin + ";" + width/2 + ";" + extent.ymax;
			} else if ((xmin > 0) && (xmax < 0) ) {
				console.log("crosses international dateline");
				var width = ((180 - xmin)*dist) + ((180 + xmax)*dist)
				extent = "-" + width/2 + ";" + extent.ymin + ";" + width/2 + ";" + extent.ymax;
			} else {
				console.log("normal extent");
				extent = extent.xmin + ";" + extent.ymin + ";" + extent.xmax + ";" + extent.ymax;
			}
			
			console.log(extent);
			*/
			
	});
	
	dojo.connect(map, 'onLoad', function() {
		dojo.connect(dijit.byId('mapDiv'), 'resize', function(){
				map.resize();
				map.reposition();
		});
		dojo.style(dojo.query("a.action.zoomTo")[0], "display", "none");
		
		tooltip = dojo.create("div", { "class": "maptooltip", "innerHTML": "" }, map.container);
		dojo.style(tooltip, { "position": "fixed", "display": "none" });

		dojo.connect(islandPointFeatures, "onMouseMove", function(evt) {
			showToolTip(evt);
		});
		
		dojo.connect(islandPointSelectionLayer, "onMouseMove", function(evt) {
			showToolTip(evt);
		});
		
		dojo.connect(islandPointHighlightLayer, "onMouseMove", function(evt) {
			showToolTip(evt);
		});		
		
		//add the overview map
		var overviewMapDijit = new esri.dijit.OverviewMap({
		map: map,
		visible:true,
		expandFactor:200
		},dojo.byId("ovContent"));
		overviewMapDijit.startup();
		
		ovMapLayer.hide();
		
		maxExtent = map.extent;
    });
	
	dojo.connect(islandPointFeatures,"onUpdateEnd", function () { 
			dojo.style("progressBarDiv", { "display":"none" });
			//console.log(map.extent);
	});
	
	dojo.connect(islandPointFeatures,"onMouseOut", function () { 
			if (tooltip) { tooltip.style.display = "none";} 
	});
	
	dojo.connect(islandPointSelectionLayer,"onMouseOut", function () { 
			if (tooltip) { tooltip.style.display = "none";} 
	});
	
	dojo.connect(islandPointHighlightLayer,"onMouseOut", function () { 
			if (tooltip) { tooltip.style.display = "none";} 
	});
	
	dojo.connect(islandPointFeatures, "onClick", function(evt) {
			var geo = evt.graphic;
			showInfoWindow(geo);
			
			/*var selectedFeatures = islandPointFeatures.getSelectedFeatures();
			var ids = dojo.map(selectedFeatures, function(item) { return item.attributes[islandPointsIslandID][0]; });
			var selected = false;
			dojo.some(ids, function(id){
				if (id == geo.attributes[islandPointsIslandID]) { selected = true; }
			});
			if (selected) {
				setHighlightSymbol(geo);
				if(dataTable) {
					var dp = dataTable.store;
					var id = geo.attributes["OBJECTID"];
					dp.fetchItemByIdentity({
						identity: id,
						onItem : function(item, request) {
							dataTable.selection.clear();
							dataTable.selection.setSelected(dataTable.getItemIndex(item), true);
							dataTable.scrollToRow(dataTable.getItemIndex(item));
						},
						onError : function(item, request) {
							alert("Error selecting the item in the data table");
						}
					});
				}	
			}*/
	});	

	dojo.connect(islandPointSelectionLayer, "onClick", function(evt) {
			var geo = evt.graphic;
			setHighlightSymbol(geo);
			showInfoWindow(geo);		
			if(dataTable) {
				var dp = dataTable.store;
				var id = geo.attributes[islandPointsIslandID];
				var attributes = dojo.map(invasiveSppIslandTable.features , function(feature){ return feature.attributes; });
				var eradication = dojo.filter(attributes, function(record) { return record[invasiveSppIslandID] == id; });
				
				dp.fetchItemByIdentity({
					identity: eradication[0]["OBJECTID"],
					onItem : function(item, request) {
						dataTable.selection.clear();
						dataTable.selection.setSelected(dataTable.getItemIndex(item), true);
						dataTable.scrollToRow(dataTable.getItemIndex(item));
					},
					onError : function(item, request) {
						alert("Error selecting the item in the data table");
					}
				});
			}
	});

	dojo.connect(islandPointHighlightLayer, "onClick", function(evt) {
			var geo = evt.graphic;
			setHighlightSymbol(geo);
			showInfoWindow(geo);		
			if(dataTable) {
				var dp = dataTable.store;
				var id = geo.attributes[islandPointsIslandID];
				var attributes = dojo.map(invasiveSppIslandTable.features , function(feature){ return feature.attributes; });
				var eradication = dojo.filter(attributes, function(record) { return record[invasiveSppIslandID] == id; });
				
				dp.fetchItemByIdentity({
					identity: eradication[0]["OBJECTID"],
					onItem : function(item, request) {
						dataTable.selection.clear();
						dataTable.selection.setSelected(dataTable.getItemIndex(item), true);
						dataTable.scrollToRow(dataTable.getItemIndex(item));
					},
					onError : function(item, request) {
						alert("Error selecting the item in the data table");
					}
				});
			}
	});		
	
	dojo.connect(map, "onUpdateEnd", function(){
			dojo.style("progressBarDiv", { "display":"none" });
	});
	
	dojo.connect(dojo.byId("zoomInToolDiv"), "onclick", function() {
		navigationTool.activate(esri.toolbars.Navigation.ZOOM_IN);
		dojo.style("mapDiv_layers", "cursor", "crosshair");
	});
	
	dojo.connect(dojo.byId("zoomInIncrementDiv"), "onclick", function() {
		map.setLevel(map.getLevel() + 1);
	});

	dojo.connect(dojo.byId("zoomOutIncrementDiv"), "onclick", function() {
		map.setLevel(map.getLevel() - 1);
	});	

	dojo.connect(dojo.byId("zoomFullToolDiv"), "onclick", function() {
		map.setExtent(maxExtent);
	});
	
	dojo.connect(dojo.byId("printToolDiv"), "onclick", function() {
		printMap();
	});	
	
	dojo.connect(dojo.byId("searchButton"), "onclick", function() {
		getSearchQueryData();
	});	
	
	dojo.connect(dojo.byId("clearButton"), "onclick", function() {
		clearSearchQueryData();
	});		
	
	dojo.connect(dijit.byId("inv_sci"), "onChange", function(isChecked) {
		if(isChecked){
			dojo.style("invasiveCommonSelectDiv", "display", "none");
			dojo.style("invasiveScientificSelectDiv", "display", "block");
			//dijit.byId("invasiveCommonSelect").set('value', filterSelectAll);
		}			
	});

	dojo.connect(dijit.byId("inv_com"), "onChange", function(isChecked) {
		if(isChecked){
			dojo.style("invasiveCommonSelectDiv", "display", "block");
			dojo.style("invasiveScientificSelectDiv", "display", "none");
			//dijit.byId("invasiveScientificSelect").set('value', filterSelectAll);
		}
	});	
	
	dojo.connect(dijit.byId("searchContentDiv"), "toggle", function (){
		// state == true means the title pane is actually closed here
		var state = this.open;

		if (state == true) {		
			if (dijit.byId("invasive").open == false) {
				dojox.fx.wipeTo({ node: this.id, duration: 150, width: 330 }).play();
				dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 310 }).play();
			} else {
				dojox.fx.wipeTo({ node: this.id, duration: 150, width: 350 }).play();
				dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 330 }).play();			
			}
			setTimeout(function() { checkResultsTableOverlap("resultsContentDiv"); }, this.duration);
		} else {
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: 70 }).play();		
		}		  
	}); 
	
	dojo.connect(dijit.byId("resultsContentDiv"), "toggle", function (){
		// state == true means the title pane is actually closed here
		var state = this.open;
		if (state == true) {
			dijit.byId("resultsContentDiv").set("title", "Results");
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: 330 }).play();
			setTimeout(function() { checkResultsTableOverlap(this.id); },  this.duration);
		} else {
			if (islandPointFeatures.getSelectedFeatures().length > 0) {
				var text = "Results: " + islandPointFeatures.getSelectedFeatures().length + " islands";
				dijit.byId("resultsContentDiv").set("title", text);
			}
			var width = dojo.getMarginBox(dojo.query("#resultsContentDiv .dijitTitlePaneTextNode")[0]).w + 20;
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: width }).play();		
		}
	});
	
	dojo.connect(dijit.byId("islandContentDiv"), "toggle", function (){
		// state == true means the title pane is actually closed here
		var state = this.open;
		var selectedTab = dijit.byId("infoTabs").selectedChildWidget.title;
		
		var islandWidth = (state == true) ? 255 : dojo.getMarginBox(dojo.query("#islandContentDiv .dijitTitlePaneTextNode")[0]).w + 20;
		//islandWidth = ((selectedTab == "Threatened") && (state == true)) ? 330 : islandWidth;
		
		var ovWidth = dojo.marginBox("ovContentDiv").w;
		var rightWidth = (ovWidth >= islandWidth) ? ovWidth : islandWidth;

		dojo.fx.combine([
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: islandWidth }),
			dojox.fx.wipeTo({ node: "rightDiv", duration: 150, width: rightWidth }),
			dojo.fx.slideTo({ node: this.id, duration: 150, top: 0, left: (rightWidth - islandWidth).toString(), unit: "px"  }),
			dojo.fx.slideTo({ node: "ovContentDiv", duration: 150, top: 0, left: (rightWidth - ovWidth).toString(), unit: "px" })
		]).play();
		
		setTimeout(function() { checkResultsTableOverlap(this.id); },  this.duration);
	});
	
	dojo.connect(dijit.byId("ovContentDiv"), "toggle", function (){
		// state == true means the title pane is actually closed here
		var state = this.open;
		var ovWidth = (state == true) ? 255 : 110;
		var islandWidth = dojo.marginBox("islandContentDiv").w;
		var rightWidth = (ovWidth >= islandWidth) ? ovWidth : islandWidth;

		dojo.fx.combine([
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: ovWidth }),
			dojox.fx.wipeTo({ node: "rightDiv", duration: 150, width: rightWidth }),
			dojo.fx.slideTo({ node: "ovContentDiv", duration: 150, top:0, left: (rightWidth - ovWidth).toString(), unit: "px", onEnd: function(node) { dojo.fx.slideTo({ node: node, duration: 150, top:0, left: (rightWidth - ovWidth).toString(), unit: "px" }).play(); } }),
			dojo.fx.slideTo({ node: "islandContentDiv", duration: 150, top: 0, left: (rightWidth - islandWidth).toString(), unit: "px" })
		]).play();
		
		setTimeout(function() { checkResultsTableOverlap("islandContentDiv"); },  this.duration);
	});
	
	dojo.connect(dijit.byId("infoTabs"), "selectChild", function() {
		var selectedTab = this.selectedChildWidget.title;
		var islandWidth = 255;
		var ovWidth = dojo.marginBox("ovContentDiv").w;
		var rightWidth = (ovWidth >= islandWidth) ? ovWidth : islandWidth;
		
		dojo.fx.combine([
			dojox.fx.wipeTo({ node:"islandContentDiv", duration: 150, width: islandWidth }),
			dojox.fx.wipeTo({ node:"islandContent", duration: 150, width: (islandWidth - 20) }),
			dojox.fx.wipeTo({ node: "rightDiv", duration: 150, width: rightWidth }),
			dojo.fx.slideTo({ node: "islandContentDiv", duration: 150, top: 0, left: (rightWidth - islandWidth).toString(), unit: "px"  }),
			dojo.fx.slideTo({ node: "ovContentDiv", duration: 150, top: 0, left: (rightWidth - ovWidth).toString(), unit: "px" })
		]).play();	
	
		dojo.style("islandContent", "overflow","");
		this.resize({w: (islandWidth - 20) });

	});	

	dojo.connect(dijit.byId("geography"), "toggle", function () {
		var state = this.open;
		if ( (state == false) && (dijit.byId("invasive").open == false) ) {
			dojox.fx.wipeTo({ node: "searchContentDiv", duration: 150, width: 330 }).play();
			dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 310 }).play();
		} else {
			dojox.fx.wipeTo({ node: "searchContentDiv", duration: 150, width: 350 }).play();
			dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 330 }).play();			
		}

		if (dijit.byId("resultsContentDiv").open == true) { dijit.byId("resultsContentDiv").toggle(); };
	});
	
	dojo.connect(dijit.byId("geography"), "onShow", function () {	
		if (dijit.byId("invasive").open == true) { dijit.byId("invasive").toggle(); };
	});		

	dojo.connect(dijit.byId("invasive"), "toggle", function () {
		var state = this.open;
		if ( (state == false) && (dijit.byId("geography").open == false) ) {
			dojox.fx.wipeTo({ node: "searchContentDiv", duration: 150, width: 330 }).play();
			dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 310 }).play();
		} else {
			dojox.fx.wipeTo({ node: "searchContentDiv", duration: 150, width: 350 }).play();
			dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 330 }).play();		
		}
		
		if (dijit.byId("resultsContentDiv").open == true) { dijit.byId("resultsContentDiv").toggle(); };
	});
	
	dojo.connect(dijit.byId("invasive"), "onShow", function () {
		if (dijit.byId("geography").open == true) { dijit.byId("geography").toggle(); };
	});	
	
	/*dojo.connect(dijit.byId("r_invasives_on_islands"), "toggle", function () {
		dojo.style("r_invasives_spp_type", "display", "none");
		dojo.style("r_invasives_status_type", "display", "none");
		setTimeout(function() { checkResultsTableOverlap("resultsContentDiv"); }, this.duration);	
	});	
	
	dojo.connect(dijit.byId("r_invasives_on_islands"), "onShow", function () {

	});	
*/
	dojo.style("searchContentDiv", "display", "block");
	dojo.style("resultsContentDiv", "display", "block");
	dojo.style("islandContentDiv", "display", "block");
	dojo.style("ovContentDiv", "display", "block");
	dojo.style("zoomToolsDiv", "display", "block");
	dojo.style("baseMapOptionDiv", "display", "block");
	
	dojo.style("aboutContent", "display", "block");
	dojo.style("aboutReferences", "display", "block");
	/*dojo.style("news", "display", "block");
	dojo.style("contributors", "display", "block");
	dojo.style("termsOfUse", "display", "block");
	dojo.style("errors", "display", "block");
	*/
	createToolbar(map);
	
	new dijit.Tooltip({ id:"print_tooltip", connectId: "printToolDiv", label:"Click to download a high-resolution PDF.", showDelay:50 });
	new dijit.Tooltip({ id:"splitter_tooltip", connectId: dojo.query(".dijitSplitterThumb")[0], label:"Click and drag to increase or decrease the viewable table.", showDelay:50 });
	new dijit.Tooltip({ id:"close_tooltip", connectId: "tableClose", label:"Click to hide or show the table.", showDelay:50 });
	new dijit.Tooltip({ id:"results_tooltip", connectId: dijit.byId("resultsContentDiv").titleBarNode, label:"Results from your custom search.", showDelay:50 });
	new dijit.Tooltip({ id:"island_tooltip", connectId: dijit.byId("islandContentDiv").titleBarNode, label:"Detailed information on a specific island.", showDelay:50 });
	new dijit.Tooltip({ id:"r_breeding_tooltip", connectId: "r_breeding_text", label:"Shift + Click for complete definitions of Breeding Status.", showDelay:50 });
	new dijit.Tooltip({ id:"experts_tooltip", connectId: "experts", label:"Click for a list of contributing experts and the TIB data collection team.", showDelay:50 });
	new dijit.Tooltip({ id:"donate_tooltip", connectId: "donateDiv", label:"Click to donate towards TIB development <br/>via the Island Conservation Paypal site.", showDelay:10, position:['above'] });
	
}

function filterSelectData(features, nameField, linkFields, unique) {

	var names = dojo.map(features, function(feature) {
			var name = feature.attributes[nameField];
			
			var links = [name];
			if (linkFields != "#") {
				dojo.forEach(linkFields, function(link) {
					links.push(feature.attributes[link]);
				});
			} else {
				links.push(name);
			}
			
			if (name != "null") { 
				return links;
			}
	});
	
	var n = [];
	if (unique) {
		n = getUniqueValuesMultiple(names);
	} else {
		n = names
	}
	
	n.sort(function (a,b) {
		// this sorts the multidimensional array using the first element    
		return ((a[0] < b[0]) ? -1 : ((a[0] > b[0]) ? 1 : 0));
	});
		
	var data = [];
	dojo.forEach(n, function(item) {
		if ((item[0] != "AR") || (item[0] != "EX")) {
			var obj = { "name": item[0], "id": item[0] };
			dojo.forEach(linkFields, function(link, i) {
				obj[link] = item[1+i];
			});
			data.push(obj);
		}
	});
	
	var obj = { "name": filterSelectAll, "id": filterSelectAll };
	dojo.forEach(linkFields, function(link, i) {
		obj[link] = filterSelectAll;
	});
	data.splice(0,0, obj);
	
	return { label:"name", identifier:"id", items: data };

}

function populateFilterSelect(data, domNode, onChange, changeNodes, property, updateNodes) {

	var store = new dojo.data.ItemFileReadStore({ data: data });
	
	if (onChange) {
		new dijit.form.FilteringSelect({
			store: store,
			autoComplete: true,
			required: false,
			searchAttr: "name",
			value: filterSelectAll,
			maxHeight: 100,
			style: "width: 305px;",
			onChange: function(name) {
					var item = this.item;
					dojo.forEach(updateNodes, function (u) {
						var v = item[u.link];
						if (v!= filterSelectAll) {
							dijit.byId(u.filter).set('value', v );
						}
					});
					
					dojo.forEach(changeNodes, function (d) {
						var query = {};
						query[property] = (name == filterSelectAll) ? "*" : new RegExp("^(" + name + "|" + filterSelectAll + ")$");
						dijit.byId(d).query = query;
						dijit.byId(d).store.fetch( { query: query, onComplete: function(items, request) {
							var y = dijit.byId(d).get('value');
							var names = dojo.map(items, function(item){ return item.name;  })
							if (dojo.indexOf(names,y) == -1) { dijit.byId(d).set('value', filterSelectAll); }
						}
						} );
						
					});
			}
		}, domNode);
	} else {
		new dijit.form.FilteringSelect({
			store: store,
			autoComplete: true,
			required: false,
			searchAttr: "name",
			value: filterSelectAll,
			maxHeight: 100,
			style: "width: 305px;"
		}, domNode);	
	}
}

function showToolTip(evt) {
	var px, py;        
	if (evt.clientX || evt.pageY) {
	  px = evt.clientX;
	  py = evt.clientY;
	} else {
	  px = evt.clientX + dojo.body().scrollLeft - dojo.body().clientLeft;
	  py = evt.clientY + dojo.body().scrollTop - dojo.body().clientTop;
	}
	
	content = evt.graphic.attributes[islandPointsName];;
	tooltip.innerHTML = content;
	
	tooltip.style.display = "none";
	dojo.style(tooltip, { left: (px + 15) + "px", top: (py) + "px" });
	tooltip.style.display = "";
}

function showInfoWindow(geo) {
	map.infoWindow.hide();
	var title = geo.attributes[islandPointsName];
	dojo.style("islandTitle", "display", "none");
	dijit.byId("islandContentDiv").set("title", geo.attributes[islandPointsName]);
	if (dijit.byId("islandContentDiv").open == false) { dijit.byId("islandContentDiv").toggle(); }
	
	var r = geo.attributes["Region_ID_Name"];
	var a = geo.attributes["Region_Archipelago"];
	var c = geo.attributes["Country"];
	var er = ((geo.attributes["Eradication_Island"] == 0) || (geo.attributes["Eradication_Island"] == "no")) ? "no" : "yes";
	var h = geo.attributes["Human_Habitation_Category"];
	var lat = geo.attributes["Corrected_Latitude"]
	var lon = geo.attributes["Corrected_Longitude"]
	var attr = { name: geo.attributes[islandPointsName], region: r, archipelago: a, country: c, eradicate: er, human: h, lat: lat, lon: lon } 
	var content = getInfoWindowContent(attr, geo.attributes[islandPointsIslandID]);

}

function getInfoWindowContent(attr, id) {
	if (dijit.byId("island_invasives_tooltip")) { dijit.byId("island_invasives_tooltip").destroyRecursive(); }			
	
	var decimal = 1000
	var infoContent = "<div id=\"island_details\">Name:<b> " + attr.name + "</b><br>" +
	"Coordinates:<b> " + (Math.round((attr.lat)*decimal)/decimal).toFixed(3) + ", " + (Math.round((attr.lon)*decimal)/decimal).toFixed(3) + "</b><br>" +
	"Region:<b> " + attr.region + "</b><br>" +
	"Country:<b> " + attr.country + "</b><br>" +
	"Archipelago:<b> " + attr.archipelago + "</b><br>";
	
	var i_count = dojo.filter(dojo.map(invasiveSppIslandTable.features, function(feature){ return feature.attributes; }), function(record) { return ((record[invasiveSppIslandID] == id) && (record["InvasiveTypeCorrected"] != "None")) }).length;

	infoContent += "<span id=\"island_invasives\">Invasive Species</span>: <b>" + i_count + "</b><br>";	
	//infoContent += (attr.eradicate == "yes") ? "<span id=\"island_eradication\" class=\"eradicationLink\" onmouseover=\"hover(this,'eradicationLinkOver');\" onmouseout=\"hover(this,'eradicationLink');\" onclick=\"getEradicationPage('" + attr.name + "')\">Eradication(s):<b> " + attr.eradicate + "</b></span><br>" : "<span id=\"island_eradication\">Eradication(s)</span>:<b> " + attr.eradicate + "</b><br>"
	infoContent += "Human Population:<b> " + attr.human + "</b><br>";
	
	infoContent += "</div>"
	
	infoDetails.set("content", infoContent);
	new dijit.Tooltip({ id:"island_invasives_tooltip", connectId: "island_invasives", label: 'All invasive species on an island', showDelay:50 }); 
	
	infoInvasive.set("content", getInvasiveSppInfoData(id));
	
	//getThreatenedSppImages(id);
	dijit.byId("infoTabs").domNode.style.display = "block";
	dijit.byId("infoTabs").resize();	
	dijit.byId("infoTabs").selectChild(infoDetails);
}

function getThreatenedSppImages(id) {
	dojo.style("galleryContentDiv", "display", "block");
	if (dojo.byId("gallery")) { dojo.query(".jcarousel-skin-tango").forEach(dojo.destroy); }
	
	if (threatendSppImages[id] !== undefined) {
			populateThreatenedSppImageGallery(threatendSppImages[id]);
	} else {	
		var data = threatenedSppIslandTable.features;
		var attributes = dojo.map(data, function(feature){ return feature.attributes; });
		var t = dojo.map(dojo.filter(attributes, function(record) { return ((record[threatenedSppIslandID] == id) && (record["Red_List_Status"] != "EX")); }), function(item) {
			return item["Scientific_Name"].replace(/\s*$/, '');
		});
		
		threatendSppImages[id] = [];
		
		if (t.length > 0) {
			var imageRequests = [];
			dojo.forEach(t, function(name) {
				//if (name.split(".").length > 1) { name = name.split(" ")[0] + " " + name.split(" ")[1] }
				if (name.search(" ssp.") > -1) { name = name.substring(0, name.search(" ssp.") ) }	
				var imageRequest = esri.request({
					url : arkiveURL.replace("[SPECIES_NAME]",name),
					handleAs:"json",
					timeout: 10000 },
					{ useProxy: true }
				).then(
					function(response) {		
						return [name, response.results[0]];
					},
					function(error) {
						return [name, "No image found"];
					}
				);
				imageRequests.push(imageRequest);
			});
			var images = new dojo.DeferredList(imageRequests);
			images.then(function(results){		
				
				var arkive = dojo.filter(results, function(data) {
					return data[1][1] != "No image found";
				});
				threatendSppImages[id] = arkive;
				populateThreatenedSppImageGallery(arkive);
			
			});
		} else {
			var div = dojo.create("div", {id: "gallery", innerHTML: "<div id=\"noThumbnails\">No thumbnail images found...</div>"}, "galleryContent", "first");
			dojo.attr(div, "class", "jcarousel-skin-tango");
			dojo.style("gallery", { background: "#eeeeee", border:"1px solid #cccccc" })
		}
	}
	
}

function populateThreatenedSppImageGallery(images) {
	if (images.length > 0) {
		var ul = dojo.create("ul", {id: "gallery", className:"jcarousel-skin-tango"}, "galleryContent", "first");
		dojo.forEach(images, function(data){
			dojo.create("li", { innerHTML: data[1][1].replace("<a", "<a target=\"_blank\"") }, ul);
		});
		
		jQuery('#gallery').jcarousel({
			buttonNextHTML: "<div></div>",
			buttonPrevHTML: "<div></div>",
			wrap: 'circular',
			easing: 'easeout',
			animation:"slow",
			scroll: 1
		});
		
		if (images.length < 3) {
			dojo.query(".jcarousel-next-horizontal")[0].style.visibility = "hidden";
			dojo.query(".jcarousel-prev-horizontal")[0].style.visibility = "hidden";
		}
	} else {
		var div = dojo.create("div", {id: "gallery", className:"jcarousel-skin-tango", innerHTML: "<div id=\"noThumbnails\">No thumbnail images found...</div>"}, "galleryContent", "first");
		dojo.style("gallery", { background: "#eeeeee", border:"1px solid #cccccc" })
	}
}

function getThreatendSppInfoData(id){
	var data = threatenedSppIslandTable.features;
	var attributes = dojo.map(data, function(feature){ return feature.attributes; });
	var ex = dojo.filter(attributes, function(record) {
		return ((record[threatenedSppIslandID] == id) && (record["Red_List_Status"] != "EX"));
	});
	ex.sort(function (a,b) { 
			return ((a["Scientific_Name"] < b["Scientific_Name"]) ? -1 : ((a["Scientific_Name"] > b["Scientific_Name"]) ? 1 : 0));
	});
	var exTypes = getUniqueValues(dojo.map(ex, function(record) { return record["Animal_Type"]; })).sort();
	
	var t = dojo.filter(attributes, function(record) {
		return ((record[threatenedSppIslandID] == id) && (record["Red_List_Status"] != "EX"));
	});
	t.sort(function (a,b) { 
			return ((a["Scientific_Name"] < b["Scientific_Name"]) ? -1 : ((a["Scientific_Name"] > b["Scientific_Name"]) ? 1 : 0));
	});
	var types = getUniqueValues(dojo.map(t, function(record) { return record["Animal_Type"]; })).sort();
	
	var content = '';
	content += '<div id="island_threat_types">'	
	dojo.forEach(types, function(type) {
		var s = dojo.filter(t, function(record) {
			return record["Animal_Type"] == type;
		});
		
		var linkFunction = ((type == "Landbird") || (type == "Seabird")) ? "getBirdLifePage" : "getRedListPage";
		
		content += '<div class="islandSummaryItem" id="island_threat_'+ type +'" onclick="toggleSubItem(this.id)"><span class="toggleImages" id="island_threat_'+ type +'_toggle"><img src="images\\plus.png"></span>&nbsp;' + type + ': ' + s.length + ' species</div>';
		
		content += '<div class="summarySubItem" id="island_threat_'+ type +'_type">';
		content += '<table class="summarySubItemTable" id="island_threat_'+ type +'_type_table">';
		content += '<tr class="i_header">' +
		'<td id="i_red_list" class="i_red_list" style="width:10%;">IUCN Status</td>' +
		'<td style="width:52%;text-align:center;"><span class="i_scientific_name">Scientific Name</span><br><span class="i_common_name">(Common Name)</span></td>' +
		'<td id="i_breeding" style="width:38%;text-align:center;" onclick="definitions.show();"><span class="i_present_breeding">Present Breeding</span><br><span class="i_historic_breeding">(Historic Breeding)</span></td>' +
		'</tr>';
		
		dojo.forEach(s, function(item, i){
			var scientific_name = item["Scientific_Name"];
			var species_id = String(item["Threatened_Species_ID_Corrected"]);
			var common_name = (item["Common_Name"] != null) ? item["Common_Name"] : "no common name";
			var red_list = item["Red_List_Status"].toLowerCase();
			var present_breeding = item["Present_Breeding_Status"].replace(" Breeding", "");
			var historic_breeding = item["Historic_Breeding_Status"].replace(" Breeding", "").replace("EX - ","");
			
			var styleClass = (Math.round(i/2) * 2 == i) ? "rowEven" : "rowOdd";
			
			var link = (linkFunction == "getBirdLifePage") ? species_id.substring(species_id.length, species_id.length - 5) : scientific_name;
			
			content += "<tr class=\"" + styleClass + "\" onclick=\"" + linkFunction + "('" + link + "')\" onmouseover=\"hover(this,'hovered');\" onmouseout=\"hover(this,'" + styleClass + "');\">" +
			"<td id=\"i_red_list_" + i + "\" class=\"i_red_list " + red_list + " \"><img src=\"images\\iucn\\iucn_" + red_list + ".png\" ></td>" +
			"<td style=\"text-align:center;\"><span class=\"i_scientific_name\">" + scientific_name + "</span><br><span class=\"i_common_name\">(" + common_name + ")</span></td>" +
			"<td style=\"text-align:center;\"><span class=\"i_present_breeding " + present_breeding.replace(" ","_").toLowerCase() + "\">" + present_breeding + "</span><br><span class=\"i_historic_breeding " + historic_breeding.replace(" ","_").toLowerCase() + "\">(" + historic_breeding + ")</span></td>" +
			"</tr>";
		});
		content += '</table>';
		content += '</div>';
	});
	content += '</div>';
	return content;
}

function getInvasiveSppInfoData(id){
	var data = invasiveSppIslandTable.features;
	var attributes = dojo.map(data , function(feature){ return feature.attributes; });
	var t = dojo.filter(attributes, function(record) {
		return record[invasiveSppIslandID] == id;
	});
	
	var content = "<div id=\"island_invasive_types\">";
	t.sort(function (a,b) { 
			return ((a["Invasive_Scientific"] < b["Invasive_Scientific"]) ? -1 : ((a["Invasive_Scientific"] > b["Invasive_Scientific"]) ? 1 : 0));
	});
	
	var types = getUniqueValues(dojo.map(t, function(record) { return record["InvasiveTypeCorrected"]; })).sort();
	dojo.forEach(types, function(type) {
		if (type != "None") {
			s = dojo.filter(t, function(record) {
				return record["InvasiveTypeCorrected"] == type;
			});
			
			content += '<div class="islandSummaryItem" id="island_invasive_'+ type +'" onclick="toggleSubItem(this.id)"><span class="toggleImages" id="island_invasive_'+ type +'_toggle"><img src="images\\plus.png"></span>&nbsp;' + type + ': ' + s.length + ' species</div>';
			
			content += '<div class="summarySubItem" id="island_invasive_'+ type +'_type">';
			content += '<table class="summarySubItemTable" id="island_invasive_'+ type +'_type_table">';
			content += '<tr class="i_header">' +
			'<td style="width:60%;text-align:center;"><span class="i_scientific_name">Scientific Name</span><br><span class="i_common_name">(Common Name)</span></td>' +
			'<td class=\"i_status\" style="width:40%;text-align:center;">Status</td>' +
			'</tr>';
			
			dojo.forEach(s, function(item, i){
				var oid = item["OBJECTID"];
				var scientific_name = item["Invasive_Scientific"];
				var common_name = (item["Invasive_Species"] != null) ? item["Invasive_Species"] : "no common name";
				var status = item["Eradication_Status"];
				var styleClass = (Math.round(i/2) * 2 == i) ? "rowEven" : "rowOdd";

				content += "<tr class=\"" + styleClass + "\" onclick=\"getEradicationDetails(" + oid + ", " + id + ")\" onmouseover=\"hover(this,'hovered');\" onmouseout=\"hover(this,'" + styleClass + "');\" >" +
				"<td style=\"text-align:center;\"><span class=\"i_scientific_name\">" + scientific_name + "</span><br>" +
				"<span class=\"i_common_name\">" + common_name + "</span></td>" +
				"<td class=\"i_status\">" + status + "</td>" +
				"</tr>";
			});
			content += '</table>';
			content += '</div>';
		}
	});
	content += '</div>';
	return content;	
}

function getEradicationDetails(oid, id) {
	
	var attributes = dojo.map(invasiveSppIslandTable.features , function(feature){ return feature.attributes; });
	var eradication = dojo.filter(attributes, function(record) { return record["OBJECTID"] == oid; });
	
	var attributes = dojo.map(islandPointFeatures.graphics , function(feature){ return feature.attributes; });
	var island = dojo.filter(attributes, function(record) { return record[islandPointsIslandID] == id; });
	
	var values = dojo.clone(eradication[0]);
	var joins = dojo.clone(island[0]);
	if (values.hasOwnProperty("OBJECTID")) {
		delete values["OBJECTID"];
	}
	if (values.hasOwnProperty(invasiveSppIslandID)) {
		delete values[invasiveSppIslandID]
	}
	if (joins.hasOwnProperty("OBJECTID")) {
		delete joins["OBJECTID"];
	}
	
	for (item in joins) {
		values[item] = joins[item];
	};
	
	console.log(values);
	var fields = [];
	for(outField in values){
			dojo.some(invasiveSppIslandTable.fields, function(field){
					if (field.name == outField) { fields.push(field); }
			});
			dojo.some(islandPointFeatures.fields, function(field){
					if (field.name == outField) { fields.push(field); }
			});			
	};
	
	var i = fields.splice(22,fields.length-1);
	dojo.forEach(i.reverse(), function(field) {
		fields.splice(4,0,field);
	})

	i=0
	content = "<table style=\"width:100%;border-collapse: collapse;\">"
	content += "<tr><td style=\"width:35%;\"></td><td></td></tr>"
	content += "<tr><td colspan=2 class= \"detailsHeader\">Species Details</td></tr>"
	dojo.forEach(fields, function(field) {
		if (field.name == islandPointsIslandID) {
			content += "<tr><td></td><td></td></tr>"
			content += "<tr><td colspan=2 class= \"detailsHeader\">Location Details</td></tr>"
		}
		if (field.name == "Eradication_Contact") {
			content += "<tr><td></td><td></td></tr>"
			content += "<tr><td colspan=2 class= \"detailsHeader\">Contact Details</td></tr>"
		}
		if (field.name == "Eradication_Start_Date") {
			content += "<tr><td></td><td></td></tr>"
			content += "<tr><td colspan=2 class= \"detailsHeader\">Eradication Details</td></tr>"
		}
		var styleClass = (Math.round(i/2) * 2 == i) ? "rowEven" : "rowOdd";
		content += "<tr class=\"" + styleClass + "\">";
		content += "<td style=\"padding-left:4px;\">" + field.alias + "</td>";
		
		if ((values[field.name] == null) || (values[field.name] == "")) {
			var value = "--";
		} else { 
			var value = values[field.name];
		}
		
		if (field.name == "Invasive_Scientific") {
			content += "<td style=\"padding-left:4px;\"><i>" + value + "</i></td>";
		} else { 
			content += "<td style=\"padding-left:4px;\">" + value + "</td>";
		}
		content += "</tr>";
		i += 1
	});
	content += "</table>"
	
	eradicationDetails.set("content", content);
	eradicationDetails.show();

}

//search by drawing tools
function createToolbar(map) {
	drawtoolbar = new esri.toolbars.Draw(map);
	var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), new dojo.Color([255,0,0,0.2]));	
	drawtoolbar.setFillSymbol(symbol);
	dojo.connect(drawtoolbar, "onDrawEnd", queryByGeometry);
}

function changeBaseMap(node,layer) {
	var layers = [baseMapLayer, imageryLayer, ovMapLayer];
	dojo.byId("baseMapSelectorTextNode").innerHTML = node.id;
	dojo.fx.wipeOut({
		node: "baseMapSelectorOptions",
		duration: 300,
		onEnd: function(){
			dojo.style("baseMapSelector",{
				"borderRadius":"4px 4px 4px 4px"
			});
			dojo.forEach(layers, function(layer){
					layer.hide();
			});
			layer.show()
			if (layer == ovMapLayer) {
				var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([210,210,210,1]), 1), new dojo.Color([100,100,100,1]))
				islandPointFeatures.setRenderer(new esri.renderer.SimpleRenderer(symbol));
				islandPointFeatures.setSelectionSymbol(symbol);
				islandPointFeatures.refresh();
			} else {
				islandPointFeatures.setRenderer(new esri.renderer.SimpleRenderer(islandSymbol));
				islandPointFeatures.setSelectionSymbol(islandSymbol);
				islandPointFeatures.refresh();	
			}		
		}
	}).play();	
}

function printMap() {
	dojo.style("progressBarDiv", { "display":"block" });
	var extent = map.extent;
    var centralMeridian = esri.geometry.webMercatorToGeographic(extent.getCenter()).x;
	
	var xmin = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(map.extent.xmin, map.extent.ymin, map.spatialReference)).x
	var xmax = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(map.extent.xmax, map.extent.ymax, map.spatialReference)).x
	//console.log("xmin=" + xmin + "; xmax=" + xmax);
	
	var pt3 = esri.geometry.geographicToWebMercator(new esri.geometry.Point(0, 0, new esri.SpatialReference(4326)))
	var pt4 = esri.geometry.geographicToWebMercator(new esri.geometry.Point(1, 1, new esri.SpatialReference(4326)))
	var dist = new esri.geometry.Extent(pt3.x,pt3.y,pt4.x,pt4.y,map.spatialReference).getWidth();
	//console.log(dist);
	
	if ((xmin > 0) && (xmax > 0) && (centralMeridian < 0)) {
		var width = ((180 - xmin)*dist) + (xmax*dist) + (180*dist);
		extent = "-" + width/2 + ";" + extent.ymin + ";" + width/2 + ";" + extent.ymax;
	} else if ((xmin > 0) && (xmax < 0) ) {
		var width = ((180 - xmin)*dist) + ((180 + xmax)*dist)
		extent = "-" + width/2 + ";" + extent.ymin + ";" + width/2 + ";" + extent.ymax;
	} else {
		centralMeridian = 0.0;
		extent = extent.xmin + ";" + extent.ymin + ";" + extent.xmax + ";" + extent.ymax;
	}	
	
    var query = currentQuery;
    var filter = (queryDefinition.length > 0) ? queryDefinition.join("  |  ") : "< None >";
    var islands = dojo.byId("islands_sum").innerHTML;
    var species = dojo.byId("invasives_sum").innerHTML;
    var basemap = "Basic";
    var scale = Math.round(map.getScale());

    if (imageryLayer.visible == true) {
        basemap = "Satellite";
    }
    if (baseMapLayer.visible == true) {
        basemap = "Topographic";
   }
   gp = new esri.tasks.Geoprocessor(printUrl)
   var params = {
        "extent": extent,
        "query": query,
        "filter": filter,
        "islands": islands,
        "species": species,
        "basemap": basemap,
        "scale": scale,
		"centralMeridian": centralMeridian
   }
   gp.submitJob(params, getMapExport, checkMapExportStatus)
}

function getMapExport(jobInfo) {
	dojo.forEach(jobInfo.messages, function(message) {
		//console.log(message.description)
	});
	gp.getResultData(jobInfo.jobId,"output", function(output) {
		//console.log(output.value.url)
		window.open(output.value.url,'_blank','left=10000,screenX=10000');
		dojo.style("progressBarDiv", { "display":"none" });
	});
}

function checkMapExportStatus(jobInfo) {
	//console.log(jobInfo.jobStatus)
}

function baseMapSelectorToggle(){
	var display = dojo.style("baseMapSelectorOptions","display");
	if (display=="none") {
		dojo.style("baseMapSelector",{
			"borderRadius":"4px 4px 0px 0px"
		});	
		dojo.fx.wipeIn({
			node: "baseMapSelectorOptions",
			duration: 300
		}).play();
	} else {
		dojo.fx.wipeOut({
			node: "baseMapSelectorOptions",
			duration: 300,
			onEnd: function(){
				dojo.style("baseMapSelector",{
					"borderRadius":"4px 4px 4px 4px"
				});	
			}
		}).play();	
	}
}
