//start query functions
function getSearchQueryData(){
	dojo.style("progressBarDiv", { "display":"block" });
	dijit.byId("searchButton").setDisabled(true);
	dijit.byId("clearButton").setDisabled(true);
	
	var geo = false;
	var threat = false;
	var invasive = false;
	
	var region = dijit.byId("regionSelect").get('value');
	var country = dijit.byId("countrySelect").get('value');
	var island = dijit.byId("islandSelect").get('value');
	var invasiveType = dijit.byId("invasiveTypeSelect").get('value');
	var invasiveScientific = dijit.byId("invasiveScientificSelect").get('value');
	var invasiveCommon = dijit.byId("invasiveCommonSelect").get('value');
	
	queryDefinition = [];
	
	var islandSql = "";
	if (((region != filterSelectAll) && (region != "")) || ((island != filterSelectAll) && (island != ""))) { 
		geo = true;
		
		if ((island != filterSelectAll) && (island != "")) {
			islandSql = "Island_Name = '" + island.replace("'","''") + "'"
			var text = island;		
		} else if ((country != filterSelectAll) && (country != "")) {
			islandSql = "Country = '" + country + "'";
			var text = country;		
		} else if ((region != filterSelectAll) && (region != "")) {
			islandSql = "Region_ID_Name = '" + region + "'";
			var text = region;			
		} 		
		queryDefinition.push(text);
	}
	
	var invasiveSql = "";
	if ( ((invasiveType != filterSelectAll)&& (invasiveType != "")) || ((invasiveCommon != filterSelectAll) && (invasiveCommon != "")) || ((invasiveScientific != filterSelectAll) && (invasiveScientific != "")) ) {
		invasive = true;
		if ((invasiveCommon != filterSelectAll) && (invasiveCommon != "")) {
			invasiveSql = "Invasive_Species = '" + invasiveCommon.replace("'","''") + "'";
			var text = invasiveCommon;
			invasiveFilter = ["Invasive_Species", invasiveCommon];	
		} else if ((invasiveScientific != filterSelectAll)&& (invasiveScientific != "")) {
			invasiveSql = "Invasive_Scientific = '" + invasiveScientific + "'"; 
			var text = invasiveScientific;
			invasiveFilter = ["Invasive_Scientific", invasiveScientific];				
		} else if ((invasiveType != filterSelectAll)&& (invasiveType != "")) {
			invasiveSql = "InvasiveTypeCorrected = '" + invasiveType + "'";
			var text = invasiveType;
			invasiveFilter = ["InvasiveTypeCorrected", invasiveType];	
		}
		queryDefinition.push(text);
	}
	
	if (invasive) {
		if (geo) { 
			var queryTask = new esri.tasks.QueryTask(islandPointFeaturesUrl);
			var query = new esri.tasks.Query();
			query.where = (islandSql);
			query.outFields = [islandPointsIslandID];
			queryTask.execute(query, function(records) {
				if (records.features.length > 0) {
					var values = dojo.map(records.features, function(feature){ return feature.attributes[islandPointsIslandID] });
					values = getUniqueValues(values);
					invasiveSql += " AND " + invasiveSppIslandID + " IN (" + values.join(",") + ")";
					
					var queryTask = new esri.tasks.QueryTask(invasiveSppTableUrl);
					var query = new esri.tasks.Query();
					query.where = (invasiveSql);
					query.outFields = [invasiveSppIslandFields];
					queryTask.execute(query, function(records) {
						if (records.features.length > 0) {
							var invasiveResults = records.features;
							var values = dojo.map(invasiveResults, function(feature){ return feature.attributes[invasiveSppIslandID] });
							values = getUniqueValues(values);	
							
							var sql = "Island_GID_Code IN (" + values.join(",") + ")";
                            currentQuery = sql;
							var query = new esri.tasks.Query();
							query.where = (sql);
							islandPointFeatures.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function(features) {
								processIslandData(features, invasiveResults);
							});						
						} else {
							processEmptyResults();
						}
					});
				}
			});
		} else {
			var queryTask = new esri.tasks.QueryTask(invasiveSppTableUrl);
			var query = new esri.tasks.Query();
			query.where = (invasiveSql);
			query.outFields = [invasiveSppIslandFields];
			queryTask.execute(query, function(records) {
				if (records.features.length > 0) {		
					var invasiveResults = records.features;
					var values = dojo.map(invasiveResults, function(feature){ return feature.attributes[invasiveSppIslandID] });
					values = getUniqueValues(values);	
					
					var sql = "Island_GID_Code IN (" + values.join(",") + ")";
                    currentQuery = sql;
					var query = new esri.tasks.Query();
					query.where = (sql);
					islandPointFeatures.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function(features) {
						processIslandData(features, invasiveResults);
					});
				} else {
					processEmptyResults();
				}			
			});	
		}
	
	} else if (geo) {
			var queryTask = new esri.tasks.QueryTask(islandPointFeaturesUrl);
			var query = new esri.tasks.Query();
			query.where = (islandSql);
			query.outFields = [islandPointsIslandID];
			queryTask.execute(query, function(records) {
				if (records.features.length > 0) {
					var values = dojo.map(records.features, function(feature){ return feature.attributes[islandPointsIslandID] });
					values = getUniqueValues(values);
					var sql = invasiveSppIslandID + " IN (" + values.join(",") + ")";
					
					var queryTask = new esri.tasks.QueryTask(invasiveSppTableUrl);
					var query = new esri.tasks.Query();
					query.where = (sql);
					query.outFields = [invasiveSppIslandFields];
					queryTask.execute(query, function(records) {
						if (records.features.length > 0) {
							var invasiveResults = records.features;
							var values = dojo.map(invasiveResults, function(feature){ return feature.attributes[invasiveSppIslandID] });
							values = getUniqueValues(values);	
							
							var sql = "Island_GID_Code IN (" + values.join(",") + ")";
                            currentQuery = sql;
							var query = new esri.tasks.Query();
							query.where = (sql);
							islandPointFeatures.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function(features) {
								processIslandData(features, invasiveResults);
							});				
						} else {
							processEmptyResults();
						}
					});
				}
			});
	} else if (islandSql == "") {
		alert("No search filters chosen.  Please select items from the Search pane to filter by ...");
		dojo.style("progressBarDiv", { "display":"none" });
		queryDefinition.push("&lt;None&gt;")
	}
	
	dojo.byId("queryDefinition").innerHTML = "Filter: <b>" + queryDefinition.join("&nbsp;&nbsp;|&nbsp;&nbsp;") + "</b>";
}

function getIslandData(sql) {
	var query = new esri.tasks.Query();
	query.where = (sql);
	islandPointFeatures.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function(features) {
		processIslandData(features);
	});
}

function getInvasivesData(sql) {

}


//search by drawing tools
function searchToolActivate(tool){
	var active = (dojo.style(tool, "backgroundColor") == "rgb(217, 232, 249)") ? true : false;
	if (active) { 
		searchToolDeactivate();
	} else {
		dojo.style("extentSelect", { "backgroundColor":"rgb(255, 255, 255)", "border":"1px solid #ffffff" });
		dojo.style("polySelect", { "backgroundColor":"rgb(255, 255, 255)", "border":"1px solid #ffffff" });
		
		dojo.style(tool, { "backgroundColor":"rgb(217, 232, 249)", "border":"1px solid #a6b2bf" });
		switch (tool) {
		case "polySelect":
			drawtoolbar.activate(esri.toolbars.Draw.POLYGON);
			break;
		case "extentSelect":
			drawtoolbar.activate(esri.toolbars.Draw.EXTENT);
			break;	
		};
		
		var selectBoxs = dojo.query(".dijitComboBox");
		dojo.forEach(selectBoxs, function(box) {
			dijit.byId(box.id.split("_")[1]).set('value', filterSelectAll);
			dijit.byId(box.id.split("_")[1]).setDisabled(true);
		});
		dijit.byId("searchButton").setDisabled(true);
		dijit.byId("clearButton").setDisabled(true);
		activeSearch = "shape";
	}

}

function searchToolDeactivate() {
	dojo.style("extentSelect", { "backgroundColor":"rgb(255, 255, 255)", "border":"1px solid #ffffff" });
	dojo.style("polySelect", { "backgroundColor":"rgb(255, 255, 255)", "border":"1px solid #ffffff" });
	var selectBoxs = dojo.query(".dijitComboBox");
	dojo.forEach(selectBoxs, function(box) {
		dijit.byId(box.id.split("_")[1]).setDisabled(false);
	});
	dijit.byId("searchButton").setDisabled(false);
	dijit.byId("clearButton").setDisabled(false);
	drawtoolbar.deactivate();
	activeSearch = "sql";	
}

function queryByGeometry(geometry) {
	dojo.byId("queryDefinition").innerHTML = "Filter: <b>&lt;Graphic&gt;</b>";
	var queryTask = new esri.tasks.QueryTask(islandPointFeaturesUrl);	
	var query = new esri.tasks.Query();
	query.spatialRelationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;
	query.geometry = geometry;
	query.outFields = [islandPointsIslandID];
	queryTask.execute(query, function(records) {
		if (records.features.length > 0) {
			var values = dojo.map(records.features, function(feature){ return feature.attributes[islandPointsIslandID] });
			values = getUniqueValues(values);
			var sql = invasiveSppIslandID + " IN (" + values.join(",") + ")";
			
			var queryTask = new esri.tasks.QueryTask(invasiveSppTableUrl);
			var query = new esri.tasks.Query();
			query.where = (sql);
			query.outFields = [invasiveSppIslandFields];
			queryTask.execute(query, function(records) {
				if (records.features.length > 0) {
					var invasiveResults = records.features;
					var values = dojo.map(invasiveResults, function(feature){ return feature.attributes[invasiveSppIslandID] });
					values = getUniqueValues(values);	
					
					var sql = "Island_GID_Code IN (" + values.join(",") + ")";
					var query = new esri.tasks.Query();
					query.where = (sql);
					islandPointFeatures.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function(features) {
						processIslandData(features, invasiveResults);
					});						
				} else {
					processEmptyResults();
				}
			});
		}
	});	
	
	switch (geometry.type) {
	  case "polygon":
		var graphicExtent = geometry.getExtent();
		break;
	  case "extent":
		var graphicExtent = geometry;
		break;
	}	
	
	var extent = new esri.geometry.Extent(graphicExtent.xmin,graphicExtent.ymin,graphicExtent.xmax,graphicExtent.ymax, map.spatialReference);
	map.setExtent(extent.expand(1.1),true);
	
	searchToolDeactivate();
}