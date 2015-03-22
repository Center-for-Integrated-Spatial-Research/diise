function splashInit() {
	urlQueryParams = dojo.queryToObject(decodeURI(window.location.search.slice(1)));
	if (urlQueryParams.name) {
		//var stripped_url = removeVariableFromURL(window.location.href, "id");
		var type = urlQueryParams.lng;
		resetForLanguageUpdate(type);
		toggleLanguage(type);
		launchApp();
	} else {
		var type = getLanguageCookie();
		resetForLanguageUpdate(type);
		toggleLanguage(type);
		
		resizeSplash();
		dojo.style("splashFloater", { "opacity": 1 });
		
		dojo.style("exploreMapHover", {"opacity":"0", "display":"block" });
		dojo.connect(dojo.byId("exploreMap"), "onclick", function(evt) {
			launchApp();
		});
		
		dojo.connect(dojo.byId("anacapa_img"), "onclick", function(evt) {
			showSplashImage(2);
		});
		
		dojo.connect(dojo.byId("anacapa_pt"), "onclick", function(evt) {
			showSplashImage(2);
		});
		
		dojo.connect(dojo.byId("guadalupe_pt"), "onclick", function(evt) {
			showSplashImage(3);
		});
		
		dojo.connect(dojo.byId("guadalupe_img"), "onclick", function(evt) {
			showSplashImage(3);
		});
		
		dojo.connect(dojo.byId("lil_barrier_pt"), "onclick", function(evt) {
			showSplashImage(4);
		});
		
		dojo.connect(dojo.byId("lil_barrier_img"), "onclick", function(evt) {
			showSplashImage(4);
		});
		
		dojo.connect(dojo.byId("slideShow_1"), "onclick", function(){
			showSplashImage(1);
		});
		
		dojo.connect(dojo.byId("slideShow_2"), "onclick", function(){
			showSplashImage(2);
		});
		
		dojo.connect(dojo.byId("slideShow_3"), "onclick", function(){
			showSplashImage(3);
		});
		
		dojo.connect(dojo.byId("slideShow_4"), "onclick", function(){
			showSplashImage(4);
		});
		
		dojo.connect(dojo.byId("prev"), "onclick", function(){
			var images = dojo.query(".splashImage");
			var index = getSlideShowIndex();
			showSplashImage((index == 1) ? images.length : index - 1);
		});
		
		dojo.connect(dojo.byId("next"), "onclick", function(){
			var images = dojo.query(".splashImage");
			var index = getSlideShowIndex();
			showSplashImage((index == images.length) ? 1 : index + 1);
		});
		
		dojo.style(dojo.query("body")[0], "overflow", "auto");
		dojo.style(dojo.query("html")[0], "overflow", "auto");
		
		splashWindowResize = dojo.connect(window, 'resize', function() {
			resizeSplash();
		});
		
		new dijit.Tooltip({ id:"splash_language_english_tooltip", connectId: "en_language_splash", label:(config_byDijitId.hasOwnProperty('splash_language_english_tooltip')) ? config_byDijitId['splash_language_english_tooltip'] : "English", position: ["below", "above", "before", "after"], showDelay:10 });
		new dijit.Tooltip({ id:"splash_language_spanish_tooltip", connectId: "es_language_splash", label:(config_byDijitId.hasOwnProperty('splash_language_spanish_tooltip')) ? config_byDijitId['splash_language_spanish_tooltip'] : "Spanish", position: ["below", "above", "before", "after"], showDelay:10 });
	}
}

function getSlideShowIndex() {
	var images = dojo.query(".splashImage");
	var imageOpacity = dojo.map(images, function(d) {
		return dojo.style(d.id, "opacity");
	});
	var index = dojo.indexOf(imageOpacity, 1) + 1;
	return index;
}

function resizeSplash() {
	var wBox = dojo.window.getBox();
	var sBox = dojo.contentBox("splashFloater");
	var left = (sBox.w < wBox.w) ? wBox.w/2 - sBox.w/2 : 0;
	var top = (sBox.h < wBox.h) ? wBox.h/2 - sBox.h/2 : 0;
	if ((top == 0) || (left == 0)) {
		var xpos = (left == 0) ? (sBox.w - wBox.w)/2 : 0;
		var ypos = (top == 0) ? (sBox.h - wBox.h)/2 : 0;
		window.scrollTo(xpos, ypos);
	}
	dojo.style("splashFloater", { "top": top + "px", "left": left + "px" });
}

function showSplashImage(number) {
	
	var slideshow = "slideShow_" + number;
	var image = "splashImage_" + number;
	
	var current = dojo.filter(dojo.query(".splashImage"), function(d) {
		return dojo.style(d.id, "opacity") == 1;
	});
	
	if (current.length > 0) {
		var fade1 = dojo.fadeOut({
			node: current[0].id,
			duration: 1500
		});
		var fade2 = dojo.fadeIn({
			node: image,
			duration: 1500
		});
		
		var display = (number == 1) ? "block" : "none";
		dojo.forEach(dojo.query(".splash_island_content"), function(d) {
			dojo.style(d.id, "display", display);
		});
		var fades = [fade1, fade2];
		dojo.query(".circle").style("background", "#3C3C3C");
		dojo.style(slideshow, "background", "#666");	
		dojo.fx.combine(fades).play();	
	}
}

function toggleLanguage(id) {
	dojo.query(".language_circle").style({ "background":"#1c1c1c", "color":"#666" });
	dojo.query('div[id^="' + id +'"]').style( { "background":"#3c3c3c", "color":"#fff" } );
}

function removeVariableFromURL(url_string, variable_name) {
	var URL = String(url_string);
	var regex = new RegExp( "\\?" + variable_name + "=[^&]*&?", "gi");
	URL = URL.replace(regex,'?');
	regex = new RegExp( "\\&" + variable_name + "=[^&]*&?", "gi");
	URL = URL.replace(regex,'&');
	URL = URL.replace(/(\?|&)$/,'');
	regex = null;
	return URL;
}

function hoverGoToMap(image) {
	var fadeArgs = { node: "exploreMapHover", duration: 150 };
	if (image == "exploreMapHover") {
		dojo.fadeIn(fadeArgs).play();
	} else {
		dojo.fadeOut(fadeArgs).play();
	}
}

function launchApp() {
	var fadeArgs = {
		node: "splashFloater",
		duration: 1000,
		onEnd: function(){
			dojo.destroy("splashOverlay");
			if (typeof splashWindowResize !== 'undefined') { dojo.disconnect(splashWindowResize); }
			mapInit();
		}
	};
	dojo.fadeOut(fadeArgs).play();
}

function mapInit(){
	dijit.byId("application").resize();
	var w = dojo.window.getBox().w;
	var h = dojo.window.getBox().h;
	
	if ((dojo.position("topLeftDiv").x + dojo.position("topLeftDiv").w) > dojo.position("logos").x) { dojo.style("logos", "display", "none"); }
	
	dijit.byId("searchButton").setDisabled(true);
	dijit.byId("clearButton").setDisabled(true);
	
	dojo.style("progressBarDiv", { 
			display:"block",
			top: dojo.style("mapDiv", "height")/2 - dojo.style("progressBarDiv", "height")/2 + dojo.style("topDiv", "height")/2 + "px",
			left: dojo.style("mapDiv", "width")/2 - dojo.style("progressBarDiv", "width")/2 + "px"
	});
	
	//turn off map slider labels
	esri.config.defaults.map.sliderLabel = null;
	esri.config.defaults.map.slider = { right:"20px", top:"10px", width:"125px", height:null};
	esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
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
      //{"level" : 0, "resolution" : 156543.033928, "scale" : 591657527.591555}, 
      //{"level" : 1, "resolution" : 78271.5169639999, "scale" : 295828763.795777}, 
      //{"level" : 2, "resolution" : 39135.7584820001, "scale" : 147914381.897889},
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
	
	selectionSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,255,255,1]), 2), new dojo.Color([254,102,2,1]));
	
	highlightSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([246,247,146,1]), 4), new dojo.Color([254,102,2,1]));
	
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

	var queryTask = new esri.tasks.QueryTask(invasiveSppTableUrl);
	var query = new esri.tasks.Query();
	query.where = ("Eradication_Status = 'Successful' AND Eradication_End_Date >= 1950");
	var statisticDefinition = new esri.tasks.StatisticDefinition();
	statisticDefinition.statisticType = "count";
	statisticDefinition.onStatisticField = "OBJECTID";
	statisticDefinition.outStatisticFieldName = "count";
	query.outStatistics = [statisticDefinition];	
	query.groupByFieldsForStatistics = ["Eradication_End_Date"];
	query.orderByFields = ["Eradication_End_Date ASC"];
	var max = 0;
	queryTask.execute(query, function(results) {
		var data = dojo.map(results.features, function(feature, i) {
				return feature.attributes['count'];
		});
		var runningSum = dojox.lang.functional.scanl1(data, "+");
		
		var years = dojo.map(results.features, function(feature, i) {
				return feature.attributes['Eradication_End_Date'];
		});		
		
		var chartData = dojo.map(runningSum, function(item, i) {
				max = (max < item) ? item : max;
				return { x: years[i], y: item };
		});
		
		var yearLabels = dojo.map(years, function(year, i) {
				return { value: year, text: year.toString() };
		});
		
		chart = new dojox.charting.Chart2D("chartNode");
		
		var myTheme =  dojox.charting.themes.Algae;
		myTheme.chart.fill= "#ffffff";
		myTheme.chart.stroke= "#ffffff"
		myTheme.plotarea.fill = "#ffffff";
		chart.setTheme(myTheme);
		//Add the only/default plot
		chart.addPlot("default", {
			type: "Areas",
			markers: true,
			shadows: {dx:2, dy:2, dw:2},
			tension: "S"
		});	

		// Add the series of data
		chart.addSeries("Eradications", chartData, {
			stroke: {
				color: "blue",
				width: 2
			},
			fill: "lightblue"
		});

		chart.addAxis("y", {
			title: (config_byValues.hasOwnProperty('chart: y-axis')) ? config_byValues['chart: y-axis'] : 'Number of Successful Eradications', 
			titleGap:10, 
			titleFont:"normal normal normal 12px Tahoma", 
			titleFontColor:"#707070", 
			vertical: true, 
			max: max, 
			min: 0, 
			fixLower:"major", 
			fixUpper:"major",
			includeZero: true
		});
		
		chart.addAxis("x", {
			title: (config_byValues.hasOwnProperty('chart: x-axis')) ? config_byValues['chart: x-axis'] : 'Year',
			titleGap:5,
			titleOrientation: "away",
			titleFont:"normal normal normal 12px Tahoma", 
			titleFontColor:"#707070",
			labels: yearLabels,
			dropLabels: false,
			majorLabels: true,
			minorLabels: true,
			majorTick: { length: 5 }
		});
		var tip = new dojox.charting.action2d.Tooltip(chart, "default");
		// Render the chart!
		chart.render();
	});	
	
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
		appLoaded.push("islandPointFeaturesUrl");			
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
					if (obj.id == item) { items.push(obj); }
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
			var data = filterSelectData(invasiveSppIslandTable.features, "Scientific_Name", ["InvasiveTypeCorrected", "Invasive_Species"], true);
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
			var data = filterSelectData(invasiveSppIslandTable.features, "Invasive_Species", ["InvasiveTypeCorrected", "Scientific_Name"], true);
			populateFilterSelect(data, "invasiveCommonSelect", true, "", "", [{ filter: "invasiveTypeSelect", link: "InvasiveTypeCorrected" }, { filter: "invasiveScientificSelect", link: "Scientific_Name" }]);	

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

		if (!dijit.byId("eradicationStatusSelect")) {
			var data = filterSelectData(invasiveSppIslandTable.features, "Eradication_Status", ["Primary_Eradication_Method"], true);
			populateFilterSelect(data, "eradicationStatusSelect", false );
			
			dojo.connect(dijit.byId("eradicationStatusSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("eradicationStatusSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});
		}

		if (!dijit.byId("eradicationMethodSelect")) {
			var data = filterSelectData(invasiveSppIslandTable.features, "Primary_Eradication_Method", ["Eradication_Status"], true);
			populateFilterSelect(data, "eradicationMethodSelect", false);		
			dojo.connect(dijit.byId("eradicationMethodSelect"), "onFocus", function() {
				var value = this.textbox.value;
				if (value == filterSelectAll) { this.textbox.value = "";}
			});
			dojo.connect(dijit.byId("eradicationMethodSelect"), "onBlur", function() {
				var value = this.textbox.value;
				if (value == "") { this.textbox.value = filterSelectAll;}
			});
		}
		appLoaded.push("invasiveSppTableUrl");		
	});
	
	var queryTask = new esri.tasks.QueryTask(eradicationReferencesUrl);
	var query = new esri.tasks.Query();
	query.where = ("1=1");
	query.outFields = [eradicationReferencesFields];
	queryTask.execute(query, function(results) {
		//console.log(results);
		eradicationReferencesTable = results;
	});
	
	var queryTask = new esri.tasks.QueryTask(tibFeaturesUrl);
	var query = new esri.tasks.Query();
	query.where = ("1=1");
	query.returnGeometry = false;
	query.outFields = ["Island_GID_Code", "Island_Name"];
	queryTask.execute(query, function(results) {
		if (results.features.length > 0) {
			dojo.forEach(results.features, function(feature) {
				var id = feature.attributes["Island_GID_Code"]
				var name = feature.attributes["Island_Name"]
				tibIslands[id] = name;
			});
			appLoaded.push("tibFeaturesUrl");
		}
	});
	
	dojo.mixin(dijit.byId("searchContentDiv"), { _onTitleClick:function(){} });
	dojo.mixin(dijit.byId("resultsContentDiv"), { _onTitleClick:function(){} });
	dojo.mixin(dijit.byId("islandContentDiv"), { _onTitleClick:function(){} });
	
	dojo.create("div", {id: "searchContentDiv_close"}, dijit.byId("searchContentDiv").titleBarNode);
	dojo.addClass("searchContentDiv_close", "dialogClose");
	dojo.connect(dojo.byId("searchContentDiv_close"), "onclick", function(evt) {
		toggleToolState("searchToolDiv");
		var fadeArgs = {
			node: "searchContentDiv",
			onEnd: function(){
				dojo.style("searchContentDiv", { "display": "none" });
			}
		};
		dojo.fadeOut(fadeArgs).play();
	});
	
	dojo.create("div", {id: "searchContentDiv_toggle"}, dijit.byId("searchContentDiv").titleBarNode);
	dojo.addClass("searchContentDiv_toggle", "dialogToggle");
	dojo.connect(dojo.byId("searchContentDiv_toggle"), "onclick", function(evt) {
		dijit.byId("searchContentDiv").toggle();
	});
	
	dojo.create("div", {id: "resultsContentDiv_close"}, dijit.byId("resultsContentDiv").titleBarNode);
	dojo.addClass("resultsContentDiv_close", "dialogClose");
	dojo.connect(dojo.byId("resultsContentDiv_close"), "onclick", function(evt) {
		toggleToolState("resultsToolDiv");
		var fadeArgs = {
			node: "resultsContentDiv",
			onEnd: function(){
				dojo.style("resultsContentDiv", { "display": "none" })
			}
		};
		dojo.fadeOut(fadeArgs).play();
	});
	
	dojo.create("div", {id: "resultsContentDiv_toggle"}, dijit.byId("resultsContentDiv").titleBarNode);
	dojo.addClass("resultsContentDiv_toggle", "dialogToggle");
	dojo.connect(dojo.byId("resultsContentDiv_toggle"), "onclick", function(evt) {
		dijit.byId("resultsContentDiv").toggle();
	});

	dojo.create("div", {id: "islandContentDiv_close"}, dijit.byId("islandContentDiv").titleBarNode);
	dojo.addClass("islandContentDiv_close", "dialogClose");
	dojo.connect(dojo.byId("islandContentDiv_close"), "onclick", function(evt) {
		toggleToolState("islandsToolDiv");
		var fadeArgs = {
			node: "islandContentDiv",
			onEnd: function(){
				dojo.style("islandContentDiv", { "display": "none" })
			}
		};
		dojo.fadeOut(fadeArgs).play();
	});
	
	dojo.create("div", {id: "islandContentDiv_toggle"}, dijit.byId("islandContentDiv").titleBarNode);
	dojo.addClass("islandContentDiv_toggle", "dialogToggle");
	dojo.connect(dojo.byId("islandContentDiv_toggle"), "onclick", function(evt) {
		dijit.byId("islandContentDiv").toggle();
	});	
	
	
	var searchMoveableDiv = new dojo.dnd.move.parentConstrainedMoveable("searchContentDiv", {handle: dijit.byId("searchContentDiv").titleBarNode, area: "border", within: true});
	var resultsMoveableDiv = new dojo.dnd.move.parentConstrainedMoveable("resultsContentDiv", {handle: dijit.byId("resultsContentDiv").titleBarNode, area: "border", within: true});
	var islandMoveableDiv = new dojo.dnd.move.parentConstrainedMoveable("islandContentDiv", {handle: dijit.byId("islandContentDiv").titleBarNode,area: "border", within: true});
	
	dojo.style(dijit.byId("searchContentDiv").titleBarNode, {"cursor":"move"})
	dojo.style(dijit.byId("resultsContentDiv").titleBarNode, {"cursor":"move"})
	dojo.style(dijit.byId("islandContentDiv").titleBarNode, {"cursor":"move"})
	
	navigationTool = new esri.toolbars.Navigation(map);
	
	dojo.connect(map, "onExtentChange", function(extent, delta, levelChange, lod){
		navigationTool.deactivate();
		dojo.style("mapDiv_layers", "cursor", "default");
	});
	
	dojo.connect(map, 'onLoad', function() {
		dojo.connect(dijit.byId('mapDiv'), 'resize', function(){
				map.resize();
				map.reposition();
				if ((dojo.position("topLeftDiv").x + dojo.position("topLeftDiv").w) > dojo.position("logos").x) {
					dojo.style("logos", "display", "none"); 
				} else {
					dojo.style("logos", "display", "block"); 
				}
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
		overviewMapDijit = new esri.dijit.OverviewMap({
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
			if (dojo.indexOf(appLoaded, "map") === -1 ) { 
				appLoaded.push("map");
			} else {
				dojo.style("progressBarDiv", { "display":"none" });
				if (pdfDownloadUrl != "") { resetMapExport();}
			}
			checkAppLoaded();
	});
	
	/*
	dojo.connect(map, "onZoomEnd", function(extent){
		var centralMeridian = esri.geometry.webMercatorToGeographic(extent.getCenter()).x;
		console.log(centralMeridian);
		var xmin = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(extent.xmin, extent.ymin, map.spatialReference)).x
		var xmax = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(extent.xmax, extent.ymax, map.spatialReference)).x
		console.log("xmin=" + xmin + "; xmax=" + xmax);
	});
	*/
	
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
	
	dojo.connect(dojo.byId("overviewDiv"), "onclick", function() {
		var display = dojo.style("ovContentDiv", "display");
		if (display == "block") {
			dojo.fadeOut({ 
				node: "ovContentDiv",
				onEnd: function(){
					dojo.style("ovContentDiv", { "display": "none" })
				}
			}).play();
		} else {
			dojo.style("ovContentDiv", { "display": "block" });
			dojo.fadeIn({ 
				node: "ovContentDiv"
			}).play();
		}
		toggleToolState("overviewDiv");	
	});	
	
	dojo.connect(dojo.byId("printToolDiv"), "onclick", function() {
		var display = dojo.style("printOptionsDiv","display");
		if (display=="none") {
			dojo.fx.wipeIn({
				node: "printOptionsDiv",
				duration: 300
			}).play();
		} else {
			dojo.fx.wipeOut({
				node: "printOptionsDiv",
				duration: 300
			}).play();	
		}
		toggleToolState(this.id);		
	});
	
	dijit.byId("printButton").set('disabled', true);
	dijit.byId("printContinueButton").set('disabled', true);
	dojo.connect(dojo.byId("printButton"), "onclick", function() {
		dojo.style('csvTermsDiv', 'display', 'none');
		if (printTerms || csvTerms) {
			printButtonClick();
		} else {
			dojo.style('userInfoTermsDiv', 'display', 'block');
			dojo.byId('purpose').value = '';
			dojo.style('printTermsDiv', 'display', 'block');
			dijit.byId('termsOfUse').show();
		}
	});
	
	dijit.byId("csvButton").set('disabled', true);
	dijit.byId("csvContinueButton").set('disabled', true);
	dojo.connect(dojo.byId("csvButton"), "onclick", function() {		
		dojo.style('printTermsDiv', 'display', 'none');
		if (printTerms || csvTerms) {
			csvButtonClick();
		} else {
			dojo.style('userInfoTermsDiv', 'display', 'block');
			dojo.byId('purpose').value = '';
			dojo.style('csvTermsDiv', 'display', 'block');
			dijit.byId('termsOfUse').show();
		}
	});		
	
	dojo.connect(dojo.byId("exportTableToolDiv"), "onclick", function() {
		var display = dojo.style("csvOptionsDiv","display");
		if (display=="none") {
			dojo.fx.wipeIn({
				node: "csvOptionsDiv",
				duration: 300
			}).play();
		} else {
			dojo.fx.wipeOut({
				node: "csvOptionsDiv",
				duration: 300
			}).play();	
		}
		toggleToolState(this.id);
	});		
	
	dojo.connect(dojo.byId("searchButton"), "onclick", function() {
		if (dijit.byId("searchButton").get('disabled') == false) {
			getSearchQueryData();
		}
	});	
	
	dojo.connect(dojo.byId("clearButton"), "onclick", function() {	
		if (dijit.byId("clearButton").get('disabled') == false) {
			clearSearchQueryData();
		}		
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
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: 350 }).play();
			dojox.fx.wipeTo({ node: "searchContent", duration: 150, width: 330 }).play();
		} else {
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: 125 }).play();		
		}		  
	}); 
	
	dojo.connect(dijit.byId("searchContentDiv")._wipeIn, "onEnd", function(){
		checkViewPortOverlap("searchContentDiv");
	});	
	
	dojo.connect(dijit.byId("resultsContentDiv"), "toggle", function (){
		// state == true means the title pane is actually closed here
		var state = this.open;
		if (state == true) {
			//dijit.byId("resultsContentDiv").set("title", "Results");
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: 350 }).play();
		} else {
			/*if (islandPointFeatures.getSelectedFeatures().length > 0) {
				var text = "Results: " + islandPointFeatures.getSelectedFeatures().length + " islands";
				dijit.byId("resultsContentDiv").set("title", text);
			}*/
			//var width = dojo.getMarginBox(dojo.query("#resultsContentDiv .dijitTitlePaneTextNode")[0]).w + 50;
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: 130 }).play();		
		}
	});
	
	dojo.connect(dijit.byId("resultsContentDiv")._wipeIn, "onEnd", function(){
		checkViewPortOverlap("resultsContentDiv");
	});	

	dojo.connect(dijit.byId("islandContentDiv"), "toggle", function (){
		// state == true means the title pane is actually closed here
		var state = this.open;
		//var islandWidth = (state == true) ? 300 : dojo.getMarginBox(dojo.query("#islandContentDiv .dijitTitlePaneTextNode")[0]).w + 50;
		var islandWidth = (state == true) ? 300 : 185;
		dojox.fx.wipeTo({ node: this.id, duration: 150, width: islandWidth }).play();
	});
	
	dojo.connect(dijit.byId("islandContentDiv")._wipeIn, "onEnd", function(){
		checkViewPortOverlap("islandContentDiv");
	});
	
	dojo.connect(dijit.byId("infoTabs"), "selectChild", function() {
		var islandWidth = 300;
		dojo.fx.combine([
			dojox.fx.wipeTo({ node:"islandContentDiv", duration: 150, width: islandWidth }),
			dojox.fx.wipeTo({ node:"islandContent", duration: 150, width: (islandWidth - 20) })
		]).play();	
		dojo.style("islandContent", "overflow","");
		this.resize({w: (islandWidth - 20) });
	});	

	dojo.connect(dijit.byId("geography"), "toggle", function () {
		var state = this.open;
	});
	
	dojo.connect(dijit.byId("geography"), "onShow", function () {	
		if (dijit.byId("invasive").open == true) { dijit.byId("invasive").toggle(); };
		if (dijit.byId("eradication").open == true) { dijit.byId("eradication").toggle(); };
	});	
	
	dojo.connect(dijit.byId("geography")._wipeIn, "onEnd", function(){
		checkViewPortOverlap("searchContentDiv");
	});

	dojo.connect(dijit.byId("invasive"), "toggle", function () {
		var state = this.open;
	});
	
	dojo.connect(dijit.byId("invasive"), "onShow", function () {
		if (dijit.byId("geography").open == true) { dijit.byId("geography").toggle(); };
		if (dijit.byId("eradication").open == true) { dijit.byId("eradication").toggle(); };
	});

	dojo.connect(dijit.byId("invasive")._wipeIn, "onEnd", function(){
		checkViewPortOverlap("searchContentDiv");
	});
	
	dojo.connect(dijit.byId("eradication"), "toggle", function () {
		var state = this.open;
	});
	
	dojo.connect(dijit.byId("eradication"), "onShow", function () {
		if (dijit.byId("geography").open == true) { dijit.byId("geography").toggle(); };
		if (dijit.byId("invasive").open == true) { dijit.byId("invasive").toggle(); };
	});

	dojo.connect(dijit.byId("eradication")._wipeIn, "onEnd", function(){
		checkViewPortOverlap("searchContentDiv");
	});	
	
	dojo.connect(dojo.byId("tableDiv_splitter"), "onmouseup", function(){
		checkViewPortOverlap("searchContentDiv");
		checkViewPortOverlap("resultsContentDiv");
		checkViewPortOverlap("islandContentDiv");
	});
	
	var userNameTextBox = dijit.form.ValidationTextBox({
		id: "userName",
		value: "",
		required: true,
		missingMessage: "Name is required.",
		style:"width:100%; height:24px;",
		placeHolder:(config_byDijitId.hasOwnProperty("userName")) ? config_byDijitId["userName"] : "First & Last Name"
	}, "userName");
	
	var emailTextBox = dijit.form.ValidationTextBox({
		id: "email",
		value: "",
		required: true,
		missingMessage: "Email address is required.",
		style:"width:100%; height:24px;",
		placeHolder:(config_byDijitId.hasOwnProperty("email")) ? config_byDijitId["email"] : "E-mail"
	}, "email");
	
	var orgTextBox = dijit.form.ValidationTextBox({
		id: "org",
		value: "",
		required: true,
		missingMessage: "Organization is required",
		style:"width:100%; height:24px;",
		placeHolder:(config_byDijitId.hasOwnProperty("org")) ? config_byDijitId["org"] : "Organization"
	}, "org");
	
	var countryTextBox = dijit.form.ValidationTextBox({
		id: "country",
		value: "",
		required: true,
		missingMessage: "Country is required",
		style:"width:100%; height:24px;",
		placeHolder:(config_byDijitId.hasOwnProperty("country")) ? config_byDijitId["country"] : "Country"
	}, "country");
	
	dojo.connect(dojo.byId("purposeText"), "onclick", function() {
		dojo.style(this.id, "display", "none");
		dojo.byId('purpose').focus();
	})
	
	dojo.connect(dojo.byId("purpose"), "onclick", function() {
		dojo.style("purposeText", "display", "none")
	})
	
	dojo.connect(dojo.byId("purpose"), "focus", function() {
		dojo.style("purposeText", "display", "none")
	})
	
	dojo.connect(dojo.byId("purpose"), "blur", function() {
		if (this.value == "") {
			dojo.style("purposeText", "display", "block");
		}
	})

	dojo.style("searchContent", "display", "block");
	dojo.style("resultsContent", "display", "block");
	dojo.style("islandContent", "display", "block");
	dojo.style("zoomToolsDiv", "display", "block");
	dojo.style("baseMapOptionDiv", "display", "block");
	dojo.style("helpOptionDiv", "display", "block");
	
	dojo.query(".dialogContent").style("display", "block");
	createToolbar(map);

	new dijit.Tooltip({ id:"searchTool_tooltip", connectId: "searchToolDiv", label: (config_byDijitId.hasOwnProperty('searchTool_tooltip')) ? config_byDijitId['searchTool_tooltip'] : "Click to open/close the custom Search window.", position: ["below", "above", "before", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"resultsTool_tooltip", connectId: "resultsToolDiv", label:(config_byDijitId.hasOwnProperty('resultsTool_tooltip')) ? config_byDijitId['resultsTool_tooltip'] : "Click to open/close the Results window.", position: ["below", "above", "before", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"islandsTool_tooltip", connectId: "islandsToolDiv", label:(config_byDijitId.hasOwnProperty('islandsTool_tooltip')) ? config_byDijitId['islandsTool_tooltip'] : "Click to open/close the Island Details window.", position: ["below", "above", "before", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"csvTool_tooltip", connectId: "exportTableToolDiv", label:(config_byDijitId.hasOwnProperty('csvTool_tooltip')) ? config_byDijitId['csvTool_tooltip'] : "Click to export and download a .csv file of the results table.", position: ["below", "above", "before", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"printTool_tooltip", connectId: "printToolDiv", label:(config_byDijitId.hasOwnProperty('printTool_tooltip')) ? config_byDijitId['printTool_tooltip'] : "Click to export and download a high-resolution map.", position: ["below", "above", "before", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"basemap_tooltip", connectId: "baseMapSelector", label:(config_byDijitId.hasOwnProperty('basemap_tooltip')) ? config_byDijitId['basemap_tooltip'] : "Click to change the underlying basemap.",  position: ["before", "below", "above", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"overview_tooltip", connectId: "overviewDiv", label:(config_byDijitId.hasOwnProperty('overview_tooltip')) ? config_byDijitId['overview_tooltip'] : "Click to open/close the Overview Map window.", position: ["below", "above", "before", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"zoomfull_tooltip", connectId: "zoomFullToolDiv", label:(config_byDijitId.hasOwnProperty('zoomfull_tooltip')) ? config_byDijitId['zoomfull_tooltip'] : "Click to zoom out to the full extent of the map.", position: ["below", "above", "before", "after"], showDelay:50 });
	new dijit.Tooltip({ id:"zoomin_tooltip", connectId: "zoomInToolDiv", label:(config_byDijitId.hasOwnProperty('zoomin_tooltip')) ? config_byDijitId['zoomin_tooltip'] : "Click to zoom in to the map using a custom drawn extent.", position: ["below", "above", "before", "after"], showDelay:50 });
	
	new dijit.Tooltip({ id:"splitter_tooltip", connectId: dojo.query(".dijitSplitterThumb")[0], label:(config_byDijitId.hasOwnProperty('splitter_tooltip')) ? config_byDijitId['splitter_tooltip'] : "Click and drag to increase or decrease the viewable table.", showDelay:50 });
	new dijit.Tooltip({ id:"close_tooltip", connectId: "tableClose", label:(config_byDijitId.hasOwnProperty('close_tooltip')) ? config_byDijitId['close_tooltip'] : "Click to hide or show the table.", showDelay:50 });
	new dijit.Tooltip({ id:"search_tooltip", connectId: dijit.byId("searchContentDiv").titleBarNode, label:(config_byDijitId.hasOwnProperty('search_tooltip')) ? config_byDijitId['search_tooltip'] : "Build a custom search. Click + drag to move the dialog to a new position.", showDelay:50 });
	new dijit.Tooltip({ id:"results_tooltip", connectId: dijit.byId("resultsContentDiv").titleBarNode, label:(config_byDijitId.hasOwnProperty('results_tooltip')) ? config_byDijitId['results_tooltip'] : "Results from your custom search. Click + drag to move the dialog to a new position.", showDelay:50 });
	new dijit.Tooltip({ id:"island_tooltip", connectId: dijit.byId("islandContentDiv").titleBarNode, label:(config_byDijitId.hasOwnProperty('island_tooltip')) ? config_byDijitId['island_tooltip'] : "Detailed information on a specific island. Click + drag to move the dialog to a new position.", showDelay:50 });
	new dijit.Tooltip({ id:"donate_tooltip", connectId: "donateDiv", label:(config_byDijitId.hasOwnProperty('donate_tooltip')) ? config_byDijitId['donate_tooltip'] : "Click to donate towards DIISE development via the Island Conservation Paypal site.", showDelay:10, position:['above'] });
	new dijit.Tooltip({ id:"app_language_english_tooltip", connectId: "en_language_app", label:(config_byDijitId.hasOwnProperty('app_language_english_tooltip')) ? config_byDijitId['app_language_english_tooltip'] : "English", position: ["below", "above", "before", "after"], showDelay:10 });
	new dijit.Tooltip({ id:"app_language_spanish_tooltip", connectId: "es_language_app", label:(config_byDijitId.hasOwnProperty('app_language_spanish_tooltip')) ? config_byDijitId['app_language_spanish_tooltip'] : "Spanish", position: ["below", "above", "before", "after"], showDelay:10 });
	
	showDialog('searchContentDiv',150,50);
	dojo.style('ovContentDiv', {"boxShadow":"2px 2px 6px #6a6a6a", "MozBoxShadow":"2px 2px 6px #6a6a6a", "WebkitBoxShadow":"2px 2px 6px #6a6a6a"});
	//hack to set css width not honored in style sheet
	dojo.style('rectangle', 'width', '78px');
}

function checkAppLoaded() {
	if (appLoaded.length == allLayersLoaded) {
		dojo.style("progressBarDiv", { "display":"none" });
		dijit.byId("searchButton").setDisabled(false);
		dijit.byId("clearButton").setDisabled(false);
		if (urlQueryParams.name) {
			queryMapfromUrlParams(urlQueryParams)
		}
	}
}

function printButtonClick() {
	var printButtonLabel = dijit.byId("printButton").get('label');
	printButtonLabel = (config_byValues.hasOwnProperty(printButtonLabel)) ? config_byValues[printButtonLabel] : printButtonLabel;
	var exportText = (config_byValues.hasOwnProperty('Export')) ? config_byValues['Export'] : "Export";
	if ((printButtonLabel == exportText) && (dijit.byId("printButton").get('disabled') == false))  {
		var text = (config_byValues.hasOwnProperty('Exporting Map')) ? config_byValues['Exporting Map'] : "Exporting Map";
		dojo.byId("printOptionsTextNode").innerHTML =  text + '...';
		
		var label = (config_byValues.hasOwnProperty('Processing')) ? config_byValues['Processing'] : "Processing";
		dijit.byId("printButton").set('label', label + '...');
		dijit.byId("printButton").set('disabled', true);
		dojo.byId("printButton").innerHTML = label + '...';
		
		printMap();
	}
	var downloadText = (config_byValues.hasOwnProperty('Download')) ? config_byValues['Download'] : "Download";
	if ( (printButtonLabel == downloadText) && (dijit.byId("printButton").get('disabled') == false) ){
		window.open(pdfDownloadUrl,'_blank','left=10000,screenX=10000');
		dojo.fx.wipeOut({ 
			node: "printOptionsDiv",
			duration:300
		}).play();
		toggleToolState("printToolDiv");				
	}
}

function csvButtonClick() {
	var tableButtonLabel = dijit.byId("csvButton").get('label');
	tableButtonLabel = (config_byValues.hasOwnProperty(tableButtonLabel)) ? config_byValues[tableButtonLabel] : tableButtonLabel;
	var exportText = (config_byValues.hasOwnProperty('Export')) ? config_byValues['Export'] : "Export";
	if ((tableButtonLabel == exportText) && (dijit.byId("csvButton").get('disabled') == false)) {
		var text = (config_byValues.hasOwnProperty('Exporting to CSV')) ? config_byValues['Exporting to CSV'] : "Exporting to CSV";
		dojo.byId("csvOptionsTextNode").innerHTML = text + '...';
		
		var label = (config_byValues.hasOwnProperty('Processing')) ? config_byValues['Processing'] : "Processing";
		dijit.byId("csvButton").set('label', label + '...');
		dijit.byId("csvButton").set('disabled', true);
		dojo.byId("csvButton").innerHTML = label + '...';
		
		if (dijit.byId("islandsDivGrid") != undefined) {
			csvProgress();			
			exportToCsv();
			sendDiiseEmail();
		}	
	}
	
	var downloadText = (config_byValues.hasOwnProperty('Download')) ? config_byValues['Download'] : "Download";
	if ((tableButtonLabel == downloadText) && (dijit.byId("csvButton").get('disabled') == false)){
		window.open(tableDownloadUrl);
		dojo.fx.wipeOut({ 
			node: "csvOptionsDiv",
			duration:300,
			onEnd: function(){
			}
		}).play();
		toggleToolState("exportTableToolDiv");				
	}
}

function queryMapfromUrlParams(urlQueryParams){
	dijit.byId("islandSelect").set('value', urlQueryParams.name);
	delete urlQueryParams.name;
	getSearchQueryData();
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
	
	if (nameField == 'Eradication_Status') {
		n.push(['Successful (all)', 'Successsful'])
	}
	
	n.sort(function (a,b) {
		// this sorts the multidimensional array using the first element    
		return ((a[0] < b[0]) ? -1 : ((a[0] > b[0]) ? 1 : 0));
	});
	
	var data = [];
	dojo.forEach(n, function(item) {
		//if (nameField == "Country") { console.log(item[0]);}
		if ((item[0] != "AR") || (item[0] != "EX")) {
			var obj = { "name": ((config_byValues.hasOwnProperty(item[0])) ? config_byValues[item[0]] : item[0]), "id": item[0] };
			dojo.forEach(linkFields, function(link, i) {
				obj[link] = item[1+i];
			});
			data.push(obj);
		}
	});
	
	var obj = { "name": ((config_byValues.hasOwnProperty(filterSelectAll)) ? config_byValues[filterSelectAll] : filterSelectAll), "id": filterSelectAll };
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
						var field = (item['#']) ? '#' : 'id';
						query[property] = (name == filterSelectAll) ? "*" : new RegExp("(" + item[field][0] + "|" + filterSelectAll + ")");
						dijit.byId(d).query = query;
						dijit.byId(d).store.fetch( { query: query, onComplete: function(items, request) {
							var y = dijit.byId(d).get('value');
							var names = dojo.map(items, function(item){ return item.id;  })
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
	if (dojo.style("islandContentDiv", "display") != "block") { 
		showDialog("islandContentDiv",150,50);
		toggleToolState("islandsToolDiv");
	}
	if (dijit.byId("islandContentDiv").open == false) { dijit.byId("islandContentDiv").toggle(); }
	var title = geo.attributes[islandPointsName];
	dojo.style("islandTitle", "display", "none");
	//dijit.byId("islandContentDiv").set("title", geo.attributes[islandPointsName]);
	
	var r = geo.attributes["Region_ID_Name"];
	var a = geo.attributes["Region_Archipelago"];
	var c = geo.attributes["Country"];
	var er = ((geo.attributes["Eradication_Island"] == 0) || (geo.attributes["Eradication_Island"] == "no")) ? "no" : "yes";
	var h = geo.attributes["Human_Habitation_Category"];
	var lat = geo.attributes["Corrected_Latitude"];
	var lon = geo.attributes["Corrected_Longitude"];
	var area = geo.attributes["Corrected_Area_KM2"];
	var attr = { name: geo.attributes[islandPointsName], region: r, archipelago: a, country: c, eradicate: er, human: h, lat: lat, lon: lon, area: area } 
	var content = getInfoWindowContent(attr, geo.attributes[islandPointsIslandID]);

}

function getInfoWindowContent(attr, id) {
	if (dijit.byId("island_invasives_tooltip")) { dijit.byId("island_invasives_tooltip").destroyRecursive(); }
	if (dijit.byId("island_tib_tooltip")) { dijit.byId("island_tib_tooltip").destroyRecursive(); }	
	var decimal = 1000;
	var infoContent = "<div id=\"island_details\">" + ((config_byValues.hasOwnProperty('Name')) ? config_byValues['Name'] : 'Name') + ": <b> " + attr.name + "</b><br>" +
	((config_byValues.hasOwnProperty('Coordinates')) ? config_byValues['Coordinates'] : 'Coordinate') + ": <b> " + (Math.round((attr.lat)*decimal)/decimal).toFixed(3) + ", " + (Math.round((attr.lon)*decimal)/decimal).toFixed(3) + "</b><br>" +
	((config_byValues.hasOwnProperty('Region')) ? config_byValues['Region'] : 'Region') + ": <b> " + attr.region + "</b><br>" +
	((config_byValues.hasOwnProperty('Country')) ? config_byValues['Country'] : 'Country') + ": <b> " + attr.country + "</b><br>" +
	((config_byValues.hasOwnProperty('Archipelago')) ? config_byValues['Archipelago'] : 'Archipelago') + ": <b> " + attr.archipelago + "</b><br>"  +
	((config_byValues.hasOwnProperty('Area (sq km)')) ? config_byValues['Area (sq km)'] : 'Area (sq km)') + ": <b> " + (Math.round((attr.area)*decimal)/decimal).toFixed(3) + "</b><br>" +
	((config_byValues.hasOwnProperty('Human Population')) ? config_byValues['Human Population'] : 'Human Population') + ": <b> " + attr.human + "</b><br>";
	
	var i_records = dojo.filter(dojo.map(invasiveSppIslandTable.features, function(feature){ return feature.attributes; }), function(record) { return ((record[invasiveSppIslandID] == id) && (record["InvasiveTypeCorrected"] != "None")) })
	var i_species = getUniqueValues(dojo.map(i_records, function(record){ return record["Scientific_Name"]}));

	infoContent += "<span id=\"island_invasives\">" + ((config_byValues.hasOwnProperty('Invasive Species')) ? config_byValues['Invasive Species'] : 'Invasive Species') + "</span>: <b>" + i_species.length + " (" + i_records.length + " " + ((config_byValues.hasOwnProperty('eradications')) ? config_byValues['eradications'] : 'eradications') + ")</b><br>";	
	
	var threatened = ((config_byValues.hasOwnProperty('Threatened Species')) ? config_byValues['Threatened Species'] : 'Threatened Species')
	var yesno = ((config_byValues.hasOwnProperty('yes')) ? config_byValues['yes'] : 'yes')
	infoContent += (tibIslands[id] !== undefined) ? "<span id=\"island_tib\">" + threatened + "</span>: <span id=\"island_tib_yes\" class=\"eradicationLink\" onmouseover=\"hover(this,'eradicationLinkOver');\" onmouseout=\"hover(this,'eradicationLink');\" onclick=\"getTibPage(" + id + ",'" + attr.name + "')\"><b>" + ((config_byValues.hasOwnProperty('yes')) ? config_byValues['yes'] : 'yes') + "</b> (" + ((config_byValues.hasOwnProperty('search in the TIB')) ? config_byValues['search in the TIB'] : 'search in the TIB') + ")</span><br>" : "<span id=\"island_tib\">" + threatened + "</span>: <b> " + ((config_byValues.hasOwnProperty('no')) ? config_byValues['no'] : 'no') + "</b><br>";
	
	infoContent += "</div>"
	
	infoDetails.set("content", infoContent);
	new dijit.Tooltip({ id:"island_invasives_tooltip", connectId: "island_invasives", label: (config_byDijitId.hasOwnProperty('island_invasives_tooltip')) ? config_byDijitId['island_invasives_tooltip'] : 'All invasive species on an island', position: ["before", "after", "below", "above"], showDelay:50 });
	
	var value = (config_byValues.hasOwnProperty('tib_record_tooltip')) ? config_byValues['tib_record_tooltip'] : "Any threatened species on an island from the Threatened Island Biodiversity Database (TIB)."; 
	new dijit.Tooltip({ id:"island_tib_tooltip", connectId:"island_tib", label: value, position: ["before", "after", "below", "above"], showDelay:50 });	
	
	infoInvasive.set("content", getInvasiveSppInfoData(id));
	
	getInvasiveSppImages(id);
	dijit.byId("infoTabs").domNode.style.display = "block";
	dijit.byId("infoTabs").resize();	
	dijit.byId("infoTabs").selectChild(infoDetails);
}

function getInvasiveSppImages(id) {
	dojo.style("galleryContentDiv", "display", "block");
	if (dojo.byId("gallery")) { dojo.query(".jcarousel-skin-tango").forEach(dojo.destroy); }
	
	if (invasiveSppImages[id] !== undefined) {
			populateInvasiveSppImageGallery(invasiveSppImages[id]);
	} else {	
		var data = invasiveSppIslandTable.features;
		var attributes = dojo.map(data, function(feature){ return feature.attributes; });
		var t = dojo.map(dojo.filter(attributes, function(record) { return record[invasiveSppIslandID] == id; }), function(item) {
			return item["InvasiveTypeCorrected"];
		});
		var images = getUniqueValues(t)
		
		invasiveSppImages[id] = [];
		
		if (images.length > 0) {
			invasiveSppImages[id] = images;
			populateInvasiveSppImageGallery(images);
		} else {
			var div = dojo.create("div", {id: "gallery", innerHTML: "<div id=\"noThumbnails\">" + ((config_byValues.hasOwnProperty('No thumbnail images found')) ? config_byValues['No thumbnail images found'] : 'No thumbnail images found') + "...</div>"}, "galleryContent", "first");
			dojo.attr(div, "class", "jcarousel-skin-tango");
			dojo.style("gallery", { background: "#eeeeee", border:"1px solid #cccccc" })
		}
	}
	
}

function populateInvasiveSppImageGallery(images) {
	if (images.length > 0) {
		var ul = dojo.create("ul", {id: "gallery", className:"jcarousel-skin-tango"}, "galleryContent", "first");
		dojo.forEach(images, function(image){
			dojo.create("li", { innerHTML: '<img src="images/invasives/' + image.replace(new RegExp(" ", 'g'), "_").replace("(", "").replace(")", "") +'.png" alt="' + image + '" title="' + image + '" border="0"/>' }, ul);
		});
		
		jQuery('#gallery').jcarousel({
			buttonNextHTML: "<div></div>",
			buttonPrevHTML: "<div></div>",
			wrap: 'circular',
			easing: 'easeout',
			animation:"slow",
			scroll: 1
		});
		
		if (images.length < 6) {
			dojo.query(".jcarousel-next-horizontal")[0].style.visibility = "hidden";
			dojo.query(".jcarousel-prev-horizontal")[0].style.visibility = "hidden";
		}
	} else {
		var div = dojo.create("div", {id: "gallery", className:"jcarousel-skin-tango", innerHTML: "<div id=\"noThumbnails\">" + ((config_byValues.hasOwnProperty('No thumbnail images found')) ? config_byValues['No thumbnail images found'] : 'No thumbnail images found') + "...</div>"}, "galleryContent", "first");
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
			return ((a["Scientific_Name"] < b["Scientific_Name"]) ? -1 : ((a["Scientific_Name"] > b["Scientific_Name"]) ? 1 : 0));
	});
	
	var types = getUniqueValues(dojo.map(t, function(record) { return record["InvasiveTypeCorrected"]; })).sort();
	dojo.forEach(types, function(type) {
		if (type != "None") {
			s = dojo.filter(t, function(record) {
				return record["InvasiveTypeCorrected"] == type;
			});
			var spp = getUniqueValues(dojo.map(s, function(record){ return record["Scientific_Name"]}));
			var display_value = (config_byValues.hasOwnProperty(type)) ? config_byValues[type].replace("and","&") : type.replace("and","&");
			var sci_name = (config_byValues.hasOwnProperty('Scientific Name')) ? config_byValues['Scientific Name'] : 'Scientific Name';
			var com_name = (config_byValues.hasOwnProperty('Common Name')) ? config_byValues['Common Name'] : 'Common Name';
			var year_name = (config_byValues.hasOwnProperty('Year')) ? config_byValues['Year'] : 'Year';
			var status_name = (config_byValues.hasOwnProperty('Status')) ? config_byValues['Status'] : 'Status';
			var eradication_name = (config_byValues.hasOwnProperty('eradication')) ? config_byValues['eradication'] : 'eradication';
			var eradications_name = (config_byValues.hasOwnProperty('eradications')) ? config_byValues['eradications'] : 'eradications';
			
			content += '<div class="islandSummaryItem" id="island_invasive_'+ type +'" onclick="toggleSubItem(this.id)"><span class="toggleImages" id="island_invasive_'+ type +'_toggle"><img src="images\\plus.png"></span>&nbsp;' + display_value + ': ' + spp.length + ' ';
			content += (spp.length > 1) ? 'spp' :  'sp';
			content += ' (' + s.length + ' ';
			content += (s.length > 1) ? eradications_name : eradication_name;
			content += ')</div>';
			
			content += '<div class="summarySubItem" id="island_invasive_'+ type +'_type">';
			content += '<table class="summarySubItemTable" id="island_invasive_'+ type +'_type_table">';
			content += '<tr class="i_header">' +
			'<td style="width:60%;text-align:center;"><span class="i_scientific_name">' + sci_name + '</span><br><span class="i_common_name">(' + com_name + ')</span></td>' +
			'<td class=\"i_status\" style="width:40%;text-align:center;">' + status_name + '<br><span class="i_common_name">(' + year_name + ')</span></td>' +
			'</tr>';
			
			dojo.forEach(s, function(item, i){
				var oid = item["OBJECTID"];
				var scientific_name = item["Scientific_Name"];
				var common_name = (item["Invasive_Species"] != null) ? item["Invasive_Species"] : "no common name";
				var year = (item["Eradication_End_Date"] != null) ? item["Eradication_End_Date"] : "unknown";
				var status = (config_byValues.hasOwnProperty(item["Eradication_Status"])) ? config_byValues[item["Eradication_Status"]] : item["Eradication_Status"];
				common_name = (config_byValues.hasOwnProperty(common_name)) ? config_byValues[common_name] : common_name;
				year = (config_byValues.hasOwnProperty(year)) ? config_byValues[year] : year;
				
				var styleClass = (Math.round(i/2) * 2 == i) ? "rowEven" : "rowOdd";

				content += "<tr class=\"" + styleClass + "\" onclick=\"getEradicationDetails(" + oid + ", " + id + ")\" onmouseover=\"hover(this,'hovered');\" onmouseout=\"hover(this,'" + styleClass + "');\" >" +
				"<td style=\"text-align:center;\"><span class=\"i_scientific_name\">" + scientific_name + "</span><br>" +
				"<span class=\"i_common_name\">" + common_name + "</span></td>" +
				"<td class=\"i_status\">" + status + "</span><br>" +
				"<span class=\"i_common_name\">" + year + "</span></td>" +
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
	
	var attributes = dojo.map(eradicationReferencesTable.features , function(feature){ return feature.attributes; });
	var references = dojo.filter(attributes, function(record) { return record["Island_Eradication_ID"] == eradication[0]["EradicationID"]; });
	
	var i = 0
	var islandValues = island[0];
	var eradicationValues = eradication[0];
	
	content = "<table id=\"eradicationDetailsTable\" style=\"width:100%;border-collapse: collapse;\">"
	content += addEradicationDetailHeader('Species Details');
	dojo.forEach(recordSpeciesDetailFields, function(field) {
		if (eradicationValues.hasOwnProperty(field)) {
			var inField = dojo.filter(invasiveSppIslandTable.fields, function(item){
					return item.name == field;
			})[0];	
			var styleClass = (Math.round(i/2) * 2 == i) ? "rowEven" : "rowOdd";
			content += addEradicationDetailRow(eradicationValues, inField, styleClass);
			i += 1;
		}
	});
	
	i = 0
	content += addEradicationDetailHeader('Location Details');
	dojo.forEach(recordLocationDetailFields, function(field) {
		if (islandValues.hasOwnProperty(field)) {
			var inField = dojo.filter(islandPointFeatures.fields, function(item){
					return item.name == field;
			})[0];
			var styleClass = (Math.round(i/2) * 2 == i) ? "rowEven" : "rowOdd";
			content += addEradicationDetailRow(islandValues, inField, styleClass)
			i += 1;
		}
	});

	i = 0
	content += addEradicationDetailHeader('Eradication Details');
	dojo.forEach(recordEradicationDetailFields, function(field) {
		if (eradicationValues.hasOwnProperty(field)) {
			var inField = dojo.filter(invasiveSppIslandTable.fields, function(item){
					return item.name == field;
			})[0];	
			var styleClass = (Math.round(i/2) * 2 == i) ? "rowEven" : "rowOdd";
			content += addEradicationDetailRow(eradicationValues, inField, styleClass)
			i += 1;
		}
	});
	
	i = 0
	content += addEradicationDetailHeader('Contact Details');
	dojo.forEach(recordContactDetailFields, function(field) {
		if (eradicationValues.hasOwnProperty(field)) {
			var inField = dojo.filter(invasiveSppIslandTable.fields, function(item){
					return item.name == field;
			})[0];	
			var styleClass = (Math.round(i/2) * 2 == i) ? "rowEven" : "rowOdd";
			content += addEradicationDetailRow(eradicationValues, inField, styleClass)
			i += 1;
		}
	});
	
	if (references.length > 0) {
		content += "<tr><td colspan=2></td></tr>";
		content += addEradicationDetailHeader('References');
		var types = getUniqueValues(dojo.map(references, function(ref) { return ref["Reference_Type"] })).sort();
		dojo.forEach(types, function(type) {
			content += "<tr><td colspan=2></td></tr>";
			content += "<tr colspan=2 class=\"refHeader\"><td colspan=2 >" + ((config_byValues.hasOwnProperty(type)) ? config_byValues[type] : type) + "</td></tr>";
			var values = dojo.filter(references, function(item){ return item["Reference_Type"] == type; });
			dojo.forEach(values, function(value) {
				if ((value["OnlineAddress"] != "") && (value["OnlineAddress"] != null)) {
					content += '<tr><td colspan=2 style="padding-left:4px;">' + value["Reference_Full_Clean"] + '</td></tr>';
					content += '<tr><td colspan=2 style="padding-left:4px;"><a href="' + value["OnlineAddress"] + '" target="_blank"><div onclick="" class="onlineClick">' + ((config_byValues.hasOwnProperty('online')) ? config_byValues['online'] : 'online') + '</div></a></td></tr>';
				} else {
					content += "<tr><td colspan=2 style=\"padding-left:4px;\">" + value["Reference_Full_Clean"] + "</td></tr>";
				}
				content += "<tr><td colspan=2></td></tr>";
			});
			
		});
	}
	content += "</table>"
	
	eradicationDetails.set("content", content);
	eradicationDetails.show();
}

function addEradicationDetailHeader(name) {
	var content = "<tr><td></td><td></td></tr>";
	content += "<tr><td colspan=2 class= \"detailsHeader\">" + ((config_byValues.hasOwnProperty(name)) ? config_byValues[name] : name) + "</td></tr>";
	return content;
}

function addEradicationDetailRow(values, field, styleClass){
	var content = "<tr class=\"" + styleClass + "\">";
	content += "<td style=\"padding-left:4px;\">" + ((config_byValues.hasOwnProperty(field.alias)) ? config_byValues[field.alias] : field.alias) + "</td>";
			
	var value = ((values[field.name] == null) || (values[field.name] == "")) ? "--" : ((config_byValues.hasOwnProperty(values[field.name])) ? config_byValues[values[field.name]] : values[field.name]);
			
	content += (field.name == "Scientific_Name") ? "<td style=\"padding-left:4px;\"><i>" + value + "</i></td>" : "<td style=\"padding-left:4px;\">" + value + "</td>";

	content += "</tr>";
	return content;
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
	//dojo.byId("baseMapSelectorTextNode").innerHTML = node.id;
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
			toggleToolState("baseMapSelector");			
		}
	}).play();	
}

function printMap() {
	var extent = map.extent;
    var centralMeridian = esri.geometry.webMercatorToGeographic(extent.getCenter()).x;
	
	var xmin = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(map.extent.xmin, map.extent.ymin, map.spatialReference)).x
	var xmax = esri.geometry.webMercatorToGeographic(new esri.geometry.Point(map.extent.xmax, map.extent.ymax, map.spatialReference)).x
	//console.log("xmin=" + xmin + "; xmax=" + xmax);
	
	var pt3 = esri.geometry.geographicToWebMercator(new esri.geometry.Point(0, 0, new esri.SpatialReference(4326)))
	var pt4 = esri.geometry.geographicToWebMercator(new esri.geometry.Point(1, 1, new esri.SpatialReference(4326)))
	var dist = new esri.geometry.Extent(pt3.x,pt3.y,pt4.x,pt4.y,map.spatialReference).getWidth();
	//console.log(dist);
	
	/*if ((xmin > 0) && (xmax > 0) && (centralMeridian < 0)) {
		var width = ((180 - xmin)*dist) + (xmax*dist) + (180*dist);
		extent = "-" + width/2 + ";" + extent.ymin + ";" + width/2 + ";" + extent.ymax;
	} else if ((xmin > 0) && (xmax < 0) ) {
		var width = ((180 - xmin)*dist) + ((180 + xmax)*dist)
		extent = "-" + width/2 + ";" + extent.ymin + ";" + width/2 + ";" + extent.ymax;
	} else {
		centralMeridian = 0.0;
		extent = extent.xmin + ";" + extent.ymin + ";" + extent.xmax + ";" + extent.ymax;
	}	*/
	
    var query = currentQuery;
	if (queryDefinition.length > 0) {
		var queryDefinition_translate = dojo.map(queryDefinition, function(d){ return ((config_byValues.hasOwnProperty(d)) ? config_byValues[d] : d) });
	}
    var filter = (queryDefinition_translate) ? queryDefinition_translate.join("  |  ") : "< " + ((config_byValues.hasOwnProperty("None")) ? config_byValues["None"] : "None") + " >";
    var islands = dojo.byId("islands_sum").innerHTML;
    var species = dojo.byId("invasives_sum").innerHTML;
    var basemap = "Basic";
    var scale = Math.round(map.getScale());
	var format = "Letter";
	if (dijit.byId("A4").checked == true) {
		format = "A4";
	} else if (dijit.byId("PPT").checked == true) {
		format = "PPT"
	}

    if (imageryLayer.visible == true) {
        basemap = "Satellite";
    }
    if (baseMapLayer.visible == true) {
        basemap = "Topographic";
   }
   gp = new esri.tasks.Geoprocessor(printUrl)
   var params = {
        "app": 'diise',
        "language": language,
        "query": query,
        "filter": filter,
        "islands": islands,
        "species": species,
        "basemap": basemap,
        "scale": scale,
		"centralMeridian": centralMeridian,
		"format": format
   }
   console.log(params);
   gp.submitJob(params, getMapExport, checkMapExportStatus, getMapExportErrors);
   
}

function getMapExport(jobInfo) {
	gp.getResultData(jobInfo.jobId,"output", function(output) {
		dijit.byId("printProgressBar").set({ "value": dijit.byId("printProgressBar").get("maximum") });
		var text = (config_byValues.hasOwnProperty('Download Map')) ? config_byValues['Download Map'] : 'Download Map';
		dojo.byId("printOptionsTextNode").innerHTML = text;
		
		var label = (config_byValues.hasOwnProperty('Download')) ? config_byValues['Download'] : 'Download';
		dijit.byId("printButton").set('label', label);
		dojo.byId("printButton").innerHTML = label;
		dijit.byId("printButton").set('disabled', false);
		pdfDownloadUrl = output.value.url;
		if (dijit.byId("PPT").checked == true) {
			pdfDownloadUrl = pdfDownloadUrl.replace('.pdf', '.jpg')
		}
	});
}

function checkMapExportStatus(jobInfo) {
	var value = parseInt(dijit.byId("printProgressBar").get("value")) + 1;
	var max = parseInt(dijit.byId("printProgressBar").get("maximum"));
	if (value == max - 1) {
		dijit.byId("printProgressBar").set("maximum", max + 1)
	}
	dijit.byId("printProgressBar").set({ "value": value });
}

function resetMapExport(){
	var text = (config_byValues.hasOwnProperty('Export Map')) ? config_byValues['Export Map'] : 'Export Map';
	dojo.byId("printOptionsTextNode").innerHTML = text;
	dijit.byId("printProgressBar").set({ "value": 0 });
	var label = (config_byValues.hasOwnProperty('Export')) ? config_byValues['Export'] : 'Export';
	dijit.byId("printButton").set('label', label);
	dojo.byId("printButton").innerHTML = label;
	pdfDownloadUrl = "";
}

function exportToCsv() {
	gp = new esri.tasks.Geoprocessor(exportUrl);
	var params = { "Input_CSV_String": csvString };
	gp.submitJob(params, getTableExport, checkTableExportStatus, getTableExportErrors);
}

function getTableExport(jobInfo) {
	gp.getResultData(jobInfo.jobId,"Output_CSV_File", function(output) {
		dijit.byId("csvProgressBar").set({ "value": dijit.byId("csvProgressBar").get("maximum") });
		var text = (config_byValues.hasOwnProperty('Download CSV')) ? config_byValues['Download CSV'] : 'Download CSV';
		dojo.byId("csvOptionsTextNode").innerHTML = text;
		
		var label = (config_byValues.hasOwnProperty('Download')) ? config_byValues['Download'] : 'Download';
		dijit.byId("csvButton").set('label', label);
		dojo.byId("csvButton").innerHTML = label;
		dijit.byId("csvButton").set('disabled', false);
		tableDownloadUrl = output.value.url;
	});
}

function checkTableExportStatus(jobInfo) {
	var jobStatus = jobInfo.jobStatus;
	if (jobStatus == 'esriJobExecuting') {
		var value = parseInt(dijit.byId("csvProgressBar").get("value")) + 1;
		var max = parseInt(dijit.byId("csvProgressBar").get("maximum"));
		if (value == max - 1) {
			dijit.byId("csvProgressBar").set("maximum", max + 1)
		}
		dijit.byId("csvProgressBar").set({ "value": value });
	} else if (jobStatus == 'esriJobFailed') {
		tableExportError(jobInfo);
		resetCsvExport();
		dojo.fx.wipeOut({
				node: "csvOptionsDiv",
				duration: 300
			}).play();
		toggleToolState('exportTableToolDiv');
	}
}

function tableExportError(jobInfo) {
	var errors = dojo.filter(jobInfo.messages, function(message){
		return message.type == 'esriJobMessageTypeError';
	});
	var errorDescriptions = dojo.map(errors, function(error) {
		return error.description; 
	});
	var traceBack = '';
	dojo.forEach(errorDescriptions, function(error) {
		if (error.indexOf('Trace') > -1) {
			traceBack += error;
		}
	});
	var query = 'Query: ' + queryDefinition.join(" | ");
	
	dojo.byId('csvExportErrorContent').innerHTML = 'Failed to Execute (Table to CSV).  Please contact <a href="mailto:science@islandconservation.org?subject=' + encodeURIComponent('Error exporting DIISE table') + '&body=' + encodeURIComponent(query + '\n' + traceBack) +'">science@islandconservation.org</a> to report the issue.';
	dijit.byId('csvExportError').show();
}

function resetCsvExport(){
	var text = (config_byValues.hasOwnProperty('Export to CSV')) ? config_byValues['Export to CSV'] : 'Export to CSV';
	dojo.byId("csvOptionsTextNode").innerHTML = text;
	dijit.byId("csvProgressBar").set({ "value": 0 });
	var label = (config_byValues.hasOwnProperty('Export')) ? config_byValues['Export'] : 'Export';
	dijit.byId("csvButton").set('label', label);
	dojo.byId("csvButton").innerHTML = label;
	tableDownloadUrl = "";
}

function csvProgress(){
	var value = parseInt(dijit.byId("csvProgressBar").get("value")) + 1;
	var max = parseInt(dijit.byId("csvProgressBar").get("maximum"));
	dijit.byId("csvProgressBar").set("maximum", max + 1)
	dijit.byId("csvProgressBar").set({ "value": value });
}

function getMapExportErrors(error) {
	console.log(error);
	resetMapExport();
}

function getTableExportErrors(error) {
	console.log(error);
	resetCsvExport();
}

function showDialog(id, top, left){
		var display = dojo.style(id, "display");
		if (display == "block") {
			dojo.fadeOut({ 
				node: id,
				onEnd: function(){
					dojo.style(id, { "display": "none" })
				}
			}).play();
		} else {
			dojo.style(id, { "display": "block" });
			dojo.fadeIn({ 
				node: id
			}).play();
		}
}


function baseMapSelectorToggle(){
	toggle("baseMapSelectorOptions");
	toggleToolState("baseMapSelector");	
}

function helpSelectorToggle(){
	toggle("helpSelectorOptions");
	toggleToolState("helpSelector");	
}

function toolHover(id, action){
	var tool = dojo.byId(id);
	var height = dojo.style(id, "height");
	var state = tool.getAttribute('data-state');
	
	if (action == "over") {
		var y = (height * 2) + "px";
		var position = "0px -" + y;
	} else {
		var y = height + "px";
		var position = (state == "on") ? "0px -" + y  : "0px 0px";
		
	}
	dojo.style(id, { "backgroundPosition": position });
}

function toggleToolState(id) {
	var tool = dojo.byId(id);
	var height = dojo.style(id, "height");
	var state = tool.getAttribute('data-state');
	
	if (state == "on") {
		tool.setAttribute('data-state', 'off');
		var position =  "0px 0px";
	} else {
		tool.setAttribute('data-state', 'on');
		var position = "0px -" + height + "px";
	}
	dojo.style(id, { "backgroundPosition": position });
}

function toggleOptions(id) {
	toggle(id);
}

function toggle(id) {
	var display = dojo.style(id,"display");
	if (display=="none") {
		dojo.fx.wipeIn({
			node: id,
			duration: 300
		}).play();
	} else {
		dojo.fx.wipeOut({
			node: id,
			duration: 300
		}).play();	
	}
}

function agreeToTerms(id) {
	if (id == 'csv') {
		 if (dijit.byId('csvTermsCheck').checked) {
			csvTermsConnect = dojo.connect(dijit.byId('termsOfUse'), 'hide', function() {
				if (!csvTerms) {
					csvTerms = true;
					dojo.style("userInfoTermsDiv", "display", "none");
					dojo.style('csvTermsDiv', 'display', 'none');
					csvButtonClick();
					dojo.disconnect(csvTermsConnect);
				};
			});
			dijit.byId('termsOfUse').hide();
		 } else {
			csvTerms = false;
		 }
	}
	
	if (id == 'print') {
		 if (dijit.byId('printTermsCheck').checked) {
			printTermsConnect = dojo.connect(dijit.byId('termsOfUse'), 'hide', function() {
				if (!printTerms) {
					printTerms = true;
					dojo.style("userInfoTermsDiv", "display", "none");
					dojo.style('printTermsDiv', 'display', 'none');
					printButtonClick();
					dojo.disconnect(printTermsConnect);
				};
			});
			dijit.byId('termsOfUse').hide();
		 } else {
			printTerms = false;
		 }
	}
}

function updateTermsContinueButton(id) {
	var isValid = checkTermsOfUseDetailsIsValid();
	validateTermsOfUseDetails(isValid);
	
	if (id == 'csv') {
		if (dijit.byId('csvTermsCheck').checked && isValid.user && isValid.email && isValid.org && isValid.country) {
			dijit.byId("csvContinueButton").set('disabled', false);
			setDiiseEmailParameters();
		} else {
			dijit.byId('csvTermsCheck').set("checked", false);
			dijit.byId("csvContinueButton").set('disabled', true);
		}
	}
	
	if (id == 'print') {
		if (dijit.byId('printTermsCheck').checked && isValid.user && isValid.email && isValid.org && isValid.country) {
			dijit.byId("printContinueButton").set('disabled', false);
			setDiiseEmailParameters();
		} else {
			dijit.byId('printTermsCheck').set("checked", false);
			dijit.byId("printContinueButton").set('disabled', true);
		}
	}

}

function checkTermsOfUseDetailsIsValid() {
	var user = dijit.byId("userName").isValid();
	var email = dijit.byId("email").isValid();
	var org = dijit.byId("org").isValid();
	var country = dijit.byId("country").isValid();
	
	return { "user": user, "email": email, "org": org, "country": country}
	
}

function validateTermsOfUseDetails(valid) {	
	if (!valid.country) {
		dijit.byId("country").set("state", "Incomplete");
		dijit.byId("country").focus();
		//dijit.byId("country").focusNode.blur();
		dijit.showTooltip(
			dijit.byId("country").get("missingMessage"), 
			dijit.byId("country").domNode, 
			dijit.byId("country").get("tooltipPosition"),
			!dijit.byId("country").isLeftToRight()
		)
	}
	if (!valid.org) {
		dijit.byId("org").set("state", "Incomplete");
		dijit.byId("org").focus();
		//dijit.byId("org").focusNode.blur();
		dijit.showTooltip(
			dijit.byId("org").get("missingMessage"), 
			dijit.byId("org").domNode, 
			dijit.byId("org").get("tooltipPosition"),
			!dijit.byId("org").isLeftToRight()
		)
	}
	if (!valid.email) {
		dijit.byId("email").set("state", "Incomplete");
		dijit.byId("email").focus();
		//dijit.byId("email").focusNode.blur();
		dijit.showTooltip(
			dijit.byId("email").get("missingMessage"), 
			dijit.byId("email").domNode, 
			dijit.byId("email").get("tooltipPosition"),
			!dijit.byId("email").isLeftToRight()
		)
	}
	if (!valid.user) {
		dijit.byId("userName").set("state", "Incomplete");
		dijit.byId("userName").focus();
		//dijit.byId("userName").focusNode.blur();
		dijit.showTooltip(
			dijit.byId("userName").get("missingMessage"), 
			dijit.byId("userName").domNode, 
			dijit.byId("userName").get("tooltipPosition"),
			!dijit.byId("userName").isLeftToRight()
		)
	}
}

function setDiiseEmailParameters() {
	terms_userName = dijit.byId("userName").get("value");
	terms_email = dijit.byId("email").get("value");
	terms_org = dijit.byId("org").get("value");
	terms_country = dijit.byId("country").get("value");
	terms_purpose = dojo.byId("purpose").value;
}

function sendDiiseEmail() {
	eMailGp = new esri.tasks.Geoprocessor(emailUrl);
	var params = { 
		"User_Name": terms_userName,
		"Email": terms_email,
		"Organization": terms_org,
		"Country": terms_country,
		"Purpose": terms_purpose,
		"Query": queryDefinition.join(" | ")
	};
	eMailGp.submitJob(params, getEmailSuccess, checkEmailStatus, getEmailErrors);
}

function getEmailSuccess(jobInfo) {
	eMailGp.getResultData(jobInfo.jobId,"output", function(output) {
		console.log(output)
	});
}

function checkEmailStatus() {
	
}

function getEmailErrors(jobInfo) {
	console.log(jobInfo.messages)
}