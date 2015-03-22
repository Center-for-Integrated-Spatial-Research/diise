function processIslandData(features, invasiveResults) {
	if (features.length > 0) {
		
		//islandPointFeatures.hide();
		islandPointSelectionLayer.clear();
		dojo.forEach(features, function(feature){
			var item = new esri.Graphic();
			item.setSymbol(selectionSymbol);
			item.setAttributes(feature.attributes);
			item.setGeometry(feature.geometry)
			islandPointSelectionLayer.add(item);
		});
		
		if (dojo.style("resultsContentDiv", "display") != "block") {
			showDialog("resultsContentDiv",150,50);
			toggleToolState("resultsToolDiv");
		}
		if (dojo.style("islandContentDiv", "display") != "block") {
			showDialog("islandContentDiv",150,50);
			toggleToolState("islandsToolDiv");
		}
		
		processInvasiveData(invasiveResults);
		
		var geometry = dojo.map(features, function(feature){ return feature.geometry; });
		var attributes = dojo.map(features, function(feature){ return feature.attributes; });
		var values = dojo.map(features, function(feature){ return feature.attributes[islandPointsIslandID] });
		var fields = [];
		dojo.forEach(islandPointFeaturesFields, function(outField){
				dojo.some(islandPointFeatures.fields, function(field){
						if (field.name == outField) { fields.push(field); }
				});
		});
		var oid = islandPointFeatures.objectIdField;
		//calculate and join summary data to island attributes
		invasives = dojo.filter(invasiveSppIslandTable.features, function(feature) { return (feature.attributes["InvasiveTypeCorrected"] != "None") });
		if (invasiveFilter.length > 0) {
			dojo.forEach(invasiveFilter, function(filter) {
				invasives = dojo.filter(invasives, function(feature) {
					//return (feature.attributes[filter[0]] == filter[1])
					return (feature.attributes[filter[0]].indexOf(filter[1]) != -1);
				});
			});
			invasiveFilter = [];
		}
		
		invasiveData = getIslandSummary(invasives, invasiveSppIslandID, invasiveSppID, "InvasiveTypeCorrected", values, "Total_Invasive_Species");
		var allInvasiveCounts = dojo.map(invasiveData, function(feature) { return { "value": feature["value"], "Total_Invasive_Species": feature["Total_Invasive_Species"] } });	
		var invasiveCounts = dojo.map(invasiveData, function(feature) { return { "value": feature["value"], "Total_Invasive_Species": feature["Total_Invasive_Species"] } });
		numInvasiveSpp = invasiveCounts.length
		
		var invasiveFields = [{"name":"value", "type": "esriFieldTypeDouble", "alias":"value"},{"name": "Total_Invasive_Species", "type":"esriFieldTypeInteger", "alias": "Total Invasive Species"}];
		var copy = dojo.clone(attributes);
		var data = joinFeatureAttributes(copy, allInvasiveCounts, fields, invasiveFields, oid, islandPointsIslandID, "value");
		
		invasiveStatusData = getIslandSummary(invasives, invasiveSppIslandID, invasiveSppID, "Eradication_Status", values, "Total_Invasive_Status");
		
		//populate summary table
		populateSummaryContent(values.length, invasiveData, invasiveStatusData);
		//populate islands table
		//populateDataTable(islandPointSelectionLayer.graphics, geometry, data.attributes, oid, data.fields, "islandsDivContent", "islandsDivGrid");
		
		if (activeSearch == "sql") {
			islandData = features;
			var extent = getQueryResultsExtent(features);
			map.setExtent(extent.expand(1.1),true);
            //map.setExtent(extent,true);
		}
		
		dojo.style("progressBarDiv", { "display":"none" });
	
	} else {
		islandPointSelectionLayer.clear();
		processEmptyResults();
	}
	
	dijit.byId("searchButton").setDisabled(false);
	dijit.byId("clearButton").setDisabled(false);

}

function processInvasiveData(data) {
	var oid = "OBJECTID";
	var ids = dojo.map(islandPointFeatures.graphics, function(feature){ return feature.attributes[islandPointsIslandID]; });

	dojo.forEach(data, function(feature) {
		var id = feature.attributes[invasiveSppIslandID];
		var index = dojo.indexOf(ids, id);
		feature.geometry = islandPointFeatures.graphics[index].geometry
	});
	
	var invasiveAttributes = dojo.map(data, function(feature){ return feature.attributes; });
	var islandAttributes = []

	dojo.forEach(invasiveAttributes, function(feature){
		dojo.some(islandPointFeatures.graphics, function(record){
			if ( feature[invasiveSppIslandID] == record.attributes[islandPointsIslandID] ) {
				islandAttributes.push(record.attributes);
			}
		});
	});
	
	var invasiveFields = [];
	dojo.forEach(invasiveSppIslandFields, function(outField){
			dojo.some(invasiveSppIslandTable.fields, function(field){
					if (field.name == outField) { invasiveFields.push(field); }
			});
	});	
	
	var islandFields = [];
	dojo.forEach(islandPointFeaturesFields, function(outField){
			dojo.some(islandPointFeatures.fields, function(field){
					if (field.name == outField) { islandFields.push(field); }
			});
	});
	
	joinedData = joinIslandAttributes(invasiveAttributes, islandAttributes, invasiveFields, islandFields, oid, invasiveSppIslandID, islandPointsIslandID);
	populateInvasiveDataTable(data, joinedData.attributes, oid, joinedData.fields, "islandsDivContent", "islandsDivGrid");	

}

function joinIslandAttributes(p_attributes, f_attributes, p_fields, f_fields, oid, p_key, f_key) {				
	dojo.forEach(f_fields, function(field){
		if ((field.name != oid) && (field.name != f_key)) { p_fields.push(field) };
	});
	
	dojo.forEach(p_attributes, function(p_record){
		var attributes;
		dojo.some(f_attributes, function(f_record){
			if ( p_record[p_key] == f_record[f_key] ) {
				attributes = f_record;
			}
		});
		
		i = 0;
		for (var item in attributes) {
			if ((f_fields[i].name != oid ) && (f_fields[i].name != f_key)) {
				p_record[f_fields[i].name] = attributes[f_fields[i].name];
			}
			i += 1;
		};
	});
	
	return { attributes: p_attributes, fields: p_fields };
}


function processEmptyResults() {
	closeTable();
	if (tableDownloadUrl != "") {
		resetCsvExport();
	}	
	if (dijit.byId("islandsDivGrid") != undefined) {
		dijit.byId("islandsDivGrid").destroyRecursive();
	}
	
	if (dojo.byId("tableExport") != undefined) {
		destroyTableExportButton();
	}	
	
	islandPointFeatures.clearSelection();
	islandPointSelectionLayer.clear();
	islandPointHighlightLayer.clear();
	map.graphics.clear();
	
	dojo.style("islandTitle", "display", "block");
	dijit.byId("islandContentDiv").set("title", (config_byDijitId.hasOwnProperty('islandContentDiv')) ? config_byDijitId['islandContentDiv'] : "Island Details");
	infoDetails.set("content", "");
	infoInvasive.set("content", "");
	
	dijit.byId("infoTabs").selectChild(infoDetails);	
	dijit.byId("infoTabs").domNode.style.display = "none";
	dojo.style("galleryContentDiv", "display", "none");
	
	dijit.byId("resultsContentDiv").set("title", (config_byDijitId.hasOwnProperty('resultsContentDiv')) ? config_byDijitId['resultsContentDiv'] : "Results");
	
	dojo.byId("islands_sum").innerHTML = 0;
	dojo.byId("invasives_sum").innerHTML =  "0 (0";
	dojo.byId("r_invasives_spp_type").innerHTML =  "";
	dojo.style("r_invasives_spp_type", { "display": "none", "height": "22px" });
	resultsDomNodes["r_invasives_spp_type"] = 22;
	
	dojo.byId("r_invasives_status_type").innerHTML =  "";
	dojo.style("r_invasives_status_type", { "display": "none", "height": "22px" });
	resultsDomNodes["r_invasives_status_type"] = 22;

	if (dijit.byId("geography").open == true) { dijit.byId("geography").toggle(); }
	if (dijit.byId("invasive").open == true) { dijit.byId("invasive").toggle(); }
	if (dijit.byId("eradication").open == true) { dijit.byId("eradication").toggle(); }
	//if (dijit.byId("searchContentDiv").open == false) { dijit.byId("searchContentDiv").toggle(); }
	//if (dijit.byId("ovContentDiv").open == false) { dijit.byId("ovContentDiv").toggle(); }
	if (dijit.byId("resultsContentDiv").open == false) { dijit.byId("resultsContentDiv").toggle(); }	
	dojo.style("progressBarDiv", { "display":"none" });
	
	dijit.byId("searchButton").setDisabled(false);
	dijit.byId("clearButton").setDisabled(false);
	currentQuery = "0 = 1";
	dijit.byId("printButton").set('disabled', true);
	dijit.byId("csvButton").set('disabled', true);
	csvString = "";
}

function getIslandSummary(features, field, sppField, typeField, values, outfieldName) {
	var attributes = dojo.map(features, function(feature){ return feature.attributes; });
	var summary = [ ];
	dojo.forEach(values, function(value) {
		var d = dojo.filter(attributes, function(record) {
			return record[field] == value;
		});
		
		var item = {};
		item.value = value;
		item[outfieldName] = d.length;
		item.species = dojo.map(d, function(spp) { return spp[sppField] } );
		item.type = dojo.map(d, function(spp) { return spp[typeField] } );
		item.names = dojo.map(d, function(spp) { return [spp["Scientific_Name"], spp["Invasive_Species"]] } );
		summary.push(item);
	});
	return summary;
}

function joinFeatureAttributes(p_attributes, f_attributes, p_fields, f_fields, oid, p_key, f_key) {				
	dojo.forEach(f_fields, function(field){
		if ((field.name != oid ) && (field.name != "value")) { p_fields.push(field) };
	});
	
	dojo.forEach(p_attributes, function(p_record){
		var attributes;
		dojo.some(f_attributes, function(f_record){
			if ( p_record[p_key] == f_record[f_key] ) {
				attributes = f_record;
			}
		});
		
		i = 0;
		for (var item in attributes) {
			if ((f_fields[i].name != oid ) && (f_fields[i].name != "value")) {
				p_record[f_fields[i].name] = attributes[f_fields[i].name];
			}
			i += 1;
		};
	});
	
	return { attributes: p_attributes, fields: p_fields };
}

function getQueryResultsExtent(results) {
	var x = [], y = []
	dojo.forEach(results, function(feature) {
			x.push(feature.geometry.x);
			y.push(feature.geometry.y);
			//console.log(feature.geometry.x + " | " + feature.geometry.y)
	});
	
	if (results.length > 1){
		var pts = dojo.map(results, function(feature) { return feature.geometry });
		var envelope = checkCrossesIntDateLine(pts);
		//var envelope = new esri.geometry.Extent(Math.min.apply(Math, x),Math.min.apply(Math, y), Math.max.apply(Math, x), Math.max.apply(Math, y), map.spatialReference);
	} else {
		var expand = 20000
		var envelope = new esri.geometry.Extent(x[0]-expand,y[0]-expand,x[0]+expand,y[0]+expand, map.spatialReference);
	}
	
	return envelope;
}

function checkCrossesIntDateLine(pts) {
	var x = dojo.map(pts, function(pt) { return pt.x });
	var y = dojo.map(pts, function(pt) { return pt.y });
	
	var gcs_pts = dojo.map(pts, function(pt) { return esri.geometry.webMercatorToGeographic(pt);  });
	var x_gcs = dojo.map(gcs_pts, function(pt) { return pt.x });
	var y_gcs = dojo.map(gcs_pts, function(pt) { return pt.y });
	
	var west = dojo.filter(x_gcs, function(x) { return x < 0; });
	var east = dojo.filter(x_gcs, function(x) { return x >= 0; });
	
	if (east.length > 0) { var emax = Math.max.apply(Math, east); var emin = Math.min.apply(Math, east); }
	if (west.length > 0) { var wmax = Math.max.apply(Math, west); var wmin = Math.min.apply(Math, west); }
	
	if ((west.length > 0) && (east.length > 0) && ((emin > 90) || (wmax < -90))) {
		//console.log("east (+) min=" + emin + " | west (-) max=" + wmax);
		//console.log("east (+) max=" + emax + " | west (-) min=" + wmin);
		//console.log( "crosses international date line");
		var left = esri.geometry.geographicToWebMercator(new esri.geometry.Point(emin, 0, new esri.spatialReference({ "wkid": 4326 }))).x;
		var right = esri.geometry.geographicToWebMercator(new esri.geometry.Point(wmax, 0, new esri.spatialReference({ "wkid": 4326 }))).x;
	} else {
		//console.log("does not cross international date line");
		var left = Math.min.apply(Math, x);
		var right = Math.max.apply(Math, x);
	}
	
	var envelope = new esri.geometry.Extent( { 
		"xmin": left,
		"ymin": Math.min.apply(Math, y),
		"xmax": right,
		"ymax": Math.max.apply(Math, y),
		"spatialReference": map.spatialReference
	});
	return envelope;
}


function populateSummaryContent(sum, invasiveData, invasiveStatusData){
	var invasives = dojo.map(invasiveData, function(names) { return names.species } )
	i_species = []
	dojo.forEach(invasives, function(invasive){
		i_species.push.apply(i_species, invasive);
	});
	
	var i_species_count = getUniqueValues(i_species).length
	var i_record_count = getSumValues(dojo.map(invasiveData, function(count) { return count["Total_Invasive_Species"] } ) );
	i_sums = getDataSummary(invasiveData, "type");
	
	s_sums = getDataSummary(invasiveStatusData, "type");
	dojo.byId("r_invasives_status_type").innerHTML = getSubDataSummary(s_sums, "invasive_status", "r_invasives_status_type");
	
	var noInvasive = 0;
	var noInvasivePopulations = 0;
	var na = dojo.filter(i_sums, function(sum){ return sum.value == "None" });
	if (na.length > 0) {
		noInvasive = na[0].items.length;
		noInvasivePopulations = na[0].count;		
	};

	dojo.byId("islands_sum").innerHTML = islandPointFeatures.getSelectedFeatures().length;
	dojo.byId("invasives_sum").innerHTML = (i_species_count - noInvasive) + " (" + (i_record_count - noInvasivePopulations);
	dojo.byId("r_invasives_spp_type").innerHTML = getSubDataSummary(i_sums, "invasive", "r_invasives_spp_type");
	
	if (dijit.byId("geography").open == true) { dijit.byId("geography").toggle(); }
	if (dijit.byId("invasive").open == true) { dijit.byId("invasive").toggle(); }
	if (dijit.byId("eradication").open == true) { dijit.byId("eradication").toggle(); }
	//if (dijit.byId("searchContentDiv").open == true) { dijit.byId("searchContentDiv").toggle(); }
	//if (dijit.byId("ovContentDiv").open == true) { dijit.byId("ovContentDiv").toggle(); }
	if (dijit.byId("resultsContentDiv").open == false) { dijit.byId("resultsContentDiv").toggle(); }
}

function getDataSummary(data, attr) {
	var xx = [];
	dojo.forEach(data, function(item){
			dojo.forEach(item[attr], function(x, i) {
				xx.push([ x, item["names"][i][0], item["names"][i][1], item["species"][i] ]);
			});	
	});
	var values = dojo.map(xx, function(x) { return x[0] });
	var uniques = getUniqueValues(values).sort();
	var summary = [ ];
	dojo.forEach(uniques, function(unique) {
		var d = dojo.filter(xx, function(value) {
			return value[0] == unique;
		})
		
		var item = {};
		item.value = unique;
		item.count = d.length;
		
		var species = dojo.map(d, function(x) { return x[1] });
		var uniqueSpecies = getUniqueValues(species).sort();
		var count = [];
		dojo.forEach(uniqueSpecies, function(u) {
			var s = dojo.filter(species, function(value) {
				return value == u;
			});
			
			var c = '', i = ''
			dojo.some(d, function(item){
					if (u == item[1]) { c = item[2]; i = item[3];  }
			});

			count.push([u, c, i, s.length])	
		});

		item.items = count;
		summary.push(item);
	});
	
	return summary;
}

function getSubDataSummary(sums, t, domNode) {
	var height = ((sums.length * 20) > 100) ? 102 : ((sums.length * 20) + 2);
	resultsDomNodes[domNode] = height;
	dojo.style(domNode, "height", height + "px");
	
	var content = [];
	zz = sums
	dojo.forEach(sums, function(type) {
		
		if (type.value != "None") {
			var linkFunction = "getInvasiveListPage";
			var value = type.value.replace(" Breeding","").replace(" ","_").toLowerCase();
			var display_value = (config_byValues.hasOwnProperty(type.value)) ? config_byValues[type.value].replace(" and "," & ") : type.value.replace(" and "," & ");
			var sci_name = (config_byValues.hasOwnProperty('Scientific Name')) ? config_byValues['Scientific Name'] : 'Scientific Name';
			var com_name = (config_byValues.hasOwnProperty('Common Name')) ? config_byValues['Common Name'] : 'Common Name';
			var pop_name = (config_byValues.hasOwnProperty('Eradications')) ? config_byValues['Eradications'] : 'Eradications';
			
			var text = '<div id="' + t + '_'+ value +'" onclick="toggleSubItem(this.id)"><span class="toggleImages" id="' + t + '_'+ value +'_toggle"><img src="images\\plus.png"></span>&nbsp;<span id="value_' + t + '_'+ value +'">' + display_value + '</span>: ' + type.items.length + ' ';
			text += (type.items.length > 1) ? 'spp' :  'sp';
			text += ' (' + type.count + ' ';
			text += (type.count > 1) ? config_byValues['eradications'] : config_byValues['eradication'];
			text += ')</div>';
			
			text += '<div class="summarySubItem" id="' + t + '_'+ value +'_type">';
			text += '<table class="summarySubItemTable" id="result_threat_'+ value +'_type_table">';
			if (t == "threat") {	
				text += '<tr class="i_header">' +
				'<td id="r_red_list" class="i_red_list" style="width:10%;">IUCN Status</td>' +
				'<td style="width:60%; text-align:center;"><span class="i_scientific_name">' + sci_name + '</span><br><span class="i_common_name">(' + com_name + ')</span></td>' +
				'<td style="width:30%; text-align:center;" class=\"r_count\" >' + pop_name + '</td>' +
				'</tr>';
			} else {
				text += '<tr class="i_header">' +
				'<td style="width:70%; text-align:center;"><span class="i_scientific_name">' + sci_name + '</span><br><span class="i_common_name">(' + com_name + ')</span></td>' +
				'<td style="width:30%;text-align:center;" class=\"r_count\">' + pop_name + '</td>' +
				'</tr>';
			}		
			
			dojo.forEach(type.items, function(item, i){
				if (item != undefined) {
					var scientific_name = (item[0] != null) ? item[0].replace(/\s*$/, '') : item[0];
					var common_name = (item[1] != null) ? item[1] : 'no common name';
					common_name = (config_byValues.hasOwnProperty(common_name)) ? config_byValues[common_name] : common_name;
					var species_id = String(item[2]);
					var count = item[3];
					var styleClass = (Math.round(i/2) * 2 == i) ? "rowEven" : "rowOdd";
					if (t == "threat") {
						var red_list = dojo.filter(threats, function(threat){ return threat["Scientific_Name"] == item[0] })[0]["Red_List_Status"].toLowerCase();
						var link = (linkFunction == "getBirdLifePage") ? species_id.substring(species_id.length, species_id.length - 5) : scientific_name;
						
						text += "<tr class=\"" + styleClass + "\" onclick=\"" + linkFunction + "('" + link + "')\"  onmouseover=\"hover(this,'hovered');\" onmouseout=\"hover(this,'" + styleClass + "');\">" +
						"<td id=\"r_red_list_" + i + "\" class=\"r_red_list " + red_list + " \"><img src=\"images\\iucn\\iucn_" + red_list + ".png\"></td>" +
						"<td style=\"text-align:center;\"><span class=\"r_scientific_name\">" + scientific_name + "</span><br><span class=\"r_common_name\">(" + common_name + ")<span></td>" +
						"<td class=\"r_count\" style=\"text-align:center;\">" + count + "</td>" +
						"</tr>";

					} else {
						text += "<tr class=\"" + styleClass + "\" onclick=\"" + linkFunction + "('" + scientific_name + "')\"   onmouseover=\"hover(this,'hovered');\" onmouseout=\"hover(this,'" + styleClass + "');\" style=\"text-align:center;\">" +
						"<td style=\"text-align:center;\"><span class=\"r_scientific_name\">" + scientific_name + "</span><br>" +
						"<span class=\"r_common_name\">(" + common_name + ")</span></td>" +
						"<td class=\"r_count\" style=\"text-align:center;\">" + count + "</td>" +
						"</tr>";
					}
				}
			});
			text += '</table>';
			text += '</div>'
			
			content.push(text);
		}
	})
	
	return content.join("");
}

function getInvasiveListPage(name) {
	var url = iucnInvasiveUrl.replace("[SPECIES_NAME]", name.replace(' ' , '+'));
	var vs = dojo.window.getBox();
	window.open(url, 'Invasive: ' + name,'width=' + vs.w + ', height=' + vs.h + ',toolbar=yes, location=yes, directories=yes, status=yes, menubar=yes, scrollbars=yes, copyhistory=yes,resizable=yes');
}

function getEradicationPage(name) {
	var url = icEradicationUrl + name.replace(' ' , '+');
	var vs = dojo.window.getBox();
	window.open(url, 'Eradication: ' + name,'width=' + vs.w + ', height=' + vs.h + ',toolbar=yes, location=yes, directories=yes, status=yes, menubar=yes, scrollbars=yes, copyhistory=yes,resizable=yes');
}

function getTibPage(id, name) {
	var url = tibUrl + "?id=" + id + "&name=" + name + "&lng=" + language;
	var vs = dojo.window.getBox();
	window.open(encodeURI(url), 'TIB: ' + id,'width=' + vs.w + ', height=' + vs.h + ',toolbar=yes, location=yes, directories=yes, status=yes, menubar=yes, scrollbars=yes, copyhistory=yes,resizable=yes');
}

function populateInvasiveDataTable(features, records, oid, fields, domNode, id){	
	if (dijit.byId(id) != undefined) {
		dijit.byId(id).destroyRecursive();
	}
	
	if (dojo.byId("tableExport") != undefined) {
		destroyTableExportButton();
	}
	// fields,records should be Common name, Scientific name, Animal Type, Eradication Status, Primary Method, Eradication end date, Island Name, Archipelago, Country, Region, Area (in hectares), Human Pop
	var gridFields = dojo.map(tableFields, function(tableField){
		var item = dojo.filter(fields, function(field) {
			return field.name == tableField;
		});
		return item[0];
	});
	
	var gridRecords = dojo.map(records, function(record){
		var item = {}
		dojo.forEach(gridFields, function(field) {
			var value = (config_byValues.hasOwnProperty(record[field.name])) ? config_byValues[record[field.name]] : record[field.name];
			item[field.name] = value;
		});
		item['identify_row'] = '';
		item['zoom_to_row'] = '';
		return item;
	});
	
	var data = {
		identifier: oid,
		label: oid,
		items: gridRecords
	};
	
	var islandWidth = calculateColumnWidth(gridRecords, "Island_Name");
	var archipelagoWidth = calculateColumnWidth(gridRecords, "Region_Archipelago");
	var regionWidth = calculateColumnWidth(gridRecords, "Region_ID_Name");
	var countryWidth = calculateColumnWidth(gridRecords, "Country");
	var cnameWidth = calculateColumnWidth(gridRecords, "Invasive_Species");
	var snameWidth = calculateColumnWidth(gridRecords, "Scientific_Name");

	var store = new dojo.data.ItemFileReadStore({data:data});

	// Set up dojox grid structure
	var columns = [{'name': ' ', 'field':'zoom_to_row', 'width':3, 'noresize':true, datatype:'string', formatter: function(value) { return '<div class="zoom_to_row_tool"><div class="grid_circle zoom_to_row">+</div></div>' } }, {'name': ' ', 'field':'identify_row', 'width':3, 'noresize':true, datatype:'string', formatter: function(value) { return '<div class="identify_row_tool"><div class="grid_circle identify_row">i</div></div>' }}];

	dojo.forEach(gridFields, function(field){
		if (field.name != oid) {
			if (field.name == "Island_Name") { var len = islandWidth; }
			else if (field.name == "Region_Archipelago") { var len = archipelagoWidth; }
			else if (field.name == "Region_ID_Name") { var len = regionWidth; }
			else if (field.name == "Country") { var len = countryWidth; }
			else if (field.name == "InvasiveTypeCorrected") { var len = 25; }
			else if (field.name == "Invasive_Species") { var len = (cnameWidth < 17) ? 17 : cnameWidth; }
			else if (field.name == "Scientific_Name") { var len = snameWidth; }
			else { var len = field.alias.length; }
			var width = (field.alias.length < len) ? parseInt(len * 7) + "px" : parseInt(field.alias.length * 7) + "px";
			var alias = (config_byValues.hasOwnProperty(field.alias)) ? config_byValues[field.alias] : field.alias;
			var column = { 'name': alias, 'field': field.name, 'width': width, 'noresize': true, datatype:"string" }
			columns.push(column);
		}
	});
	
	var rowsPage = gridRecords.length;

	// create the new dojox grid
	dataTable = new dojox.grid.DataGrid({
		id: id,
		store: store,
		loadingMessage: "Data loading...",
		rowSelector: '20px',
		selectionMode: "single",
		sortInfo:"3",
		rowHeight: 28,
		rowsPerPage: rowsPage,
		canSort: function(col) {
			if (col > 2) { return true; }
		}
	}, document.createElement('div'));	
	
	dataTable.setStructure(columns);
	
	dataTable.on("RowClick", function(evt) {
		var idx = evt.rowIndex, cell = evt.cell, column = cell.field, item = this.getItem(idx), store = this.store;
		if ( column == 'zoom_to_row' ) {
			map.infoWindow.hide();
			var ids = dojo.map(features, function(feature){ return feature.attributes[invasiveSppIslandID] });
			var index = dojo.indexOf(ids, store.getValue(item, invasiveSppIslandID));
			map.centerAt(features[index].geometry);
			panEnd = dojo.connect(map, "onPanEnd", function(extent,endPoint){
				var ids = dojo.map(islandPointSelectionLayer.graphics, function(feature){ return feature.attributes[islandPointsIslandID] });
				var index = dojo.indexOf(ids, store.getValue(item, invasiveSppIslandID));
				var geo = islandPointSelectionLayer.graphics[index];
				showInfoWindow(geo);
				setHighlightSymbol(geo);
				dojo.disconnect(panEnd);		
			});
		} else if  (column == "identify_row") {
			getEradicationDetails(store.getValue(item, oid),store.getValue(item, invasiveSppIslandID));
		}
	}, true);

	// append the new grid to the div "islandsDivContent":
	dijit.byId(domNode).domNode.appendChild(dataTable.domNode);
	
	// NOTE: setting the store in order to render the grid causes infowindow of selected graphics to break;
	// Call startup, in order to render the grid
	dataTable.startup();
	
	dojo.connect(dataTable, "onHeaderCellMouseOver", showHeaderTooltip);
	dojo.connect(dataTable, "onHeaderCellMouseOut", hideHeaderTooltip);	
	
	dataTable.selection.setSelected(0, true);
	
	id = dataTable.selection.getSelected()[0][invasiveSppIslandID][0];
	ids = dojo.map(islandPointSelectionLayer.graphics, function(feature){ return feature.attributes[islandPointsIslandID] });
	index = dojo.indexOf(ids, id);
	var geo = islandPointSelectionLayer.graphics[index];
	showInfoWindow(geo);
	setHighlightSymbol(geo);
	
	/*dojo.fadeOut({ 
		node: "ovContentDiv",
		onEnd: function(){ dojo.style("ovContentDiv", { "display": "none" })}
	}).play();
	toggleToolState("overviewDiv");	*/
	
	dojo.style("tableClose", "display", "block");
	convertGridDataToString(fields,records);
	openTable();
	//console.log(dataTable.attr("height"));

	dijit.byId("csvButton").set('disabled', false);
	dijit.byId("printButton").set('disabled', false);
	dojo.byId("csvOptionsTextNode").innerHTML = (config_byId.hasOwnProperty('csvOptionsTextNode')) ? config_byId['csvOptionsTextNode'] : "Export to CSV";
	dojo.byId("printOptionsTextNode").innerHTML = (config_byId.hasOwnProperty('printOptionsTextNode')) ? config_byId['printOptionsTextNode'] : "Export to PDF";
}

function convertGridDataToString(fields, records){
	var csv = "";
	dojo.forEach(fields, function(field, i){
		csv += (config_byValues.hasOwnProperty(field.alias)) ? config_byValues[field.alias] : field.alias;
		if (i < (fields.length-1)) { csv += "," }
		else { csv += "|" }
	});

	 dojo.forEach(records, function(record, i) {
		if (i < (records.length-1)) {
			dojo.forEach(fields, function (field, i) {
				var v = (config_byValues.hasOwnProperty(record[field.name])) ? config_byValues[record[field.name]] : record[field.name];
				csv += (typeof v === "string") ? v.replace(",", "") : v;
				if (i < (fields.length-1)) { csv += "," }
				else { csv += "|" }
			});
		} else {
			dojo.forEach(fields, function (field, i) {
				var v = (config_byValues.hasOwnProperty(record[field.name])) ? config_byValues[record[field.name]] : record[field.name];
				csv += (typeof v === "string") ? v.replace(",", "") : v;
				if (i < (fields.length-1)) { csv += "," }
			});
		}
	 });
	 csv = cleanCsvString(csv);
	 csvString = csv;
};

function cleanCsvString(csv) {
	var cleanCsv = csv.replace(/[\u0152]/g, 'Oe');
	cleanCsv = cleanCsv.replace(/[\u2019]/g, '\'');
	return cleanCsv;
}

function convertSelectedGridDataToCsv(){
    var str = dijit.byId("islandsDivGrid").exportSelected("csv");
    dojo.byId("hiddenInput").value  = str;
};

function destroyTableExportButton(){
	dijit.byId("table_export").destroy();
	dojo.destroy("tableExport");
}

function calculateColumnWidth(records, field) {
	var items = dojo.map(records, function(item) {
		if (item[field] != null) {
			if (item[field].length > 1) {
				return  item[field];
			} else {
				return  item[field][0];
			}
		}			
	});		
	
	var width = Math.max.apply( Math, dojo.map(items, function(item) { 
		if (item != null) { value = item.length; }	
		return  value;
	}) );
	
	return width;
}

function showHeaderTooltip(e) {
	var headerCell = e.cell.field;
	//console.log(headerCell)
	if (headerCell == "identify_row"){
		var value = (config_byValues.hasOwnProperty('species_record_tooltip')) ? config_byValues['species_record_tooltip'] : "Click on a cell to view more details about the record"; 
		dijit.showTooltip(value, e.cellNode, ['above']);
	}
	
	if (headerCell == "zoom_to_row"){
		var value = (config_byValues.hasOwnProperty('islands_record_tooltip')) ? config_byValues['islands_record_tooltip'] : "Click on a cell to pan to that island on the map"; 
		dijit.showTooltip(value, e.cellNode, ['above']);
	}
}

function hideHeaderTooltip(e) {
	var headerCell = e.cellNode.textContent.slice(0,-1);
	if (dijit.hideTooltip(e.cellNode)) {
		dijit.hideTooltip(e.cellNode)
	}
}

function toggleSubItem(id) {
	var display = dojo.style(id + "_type", "display");
	newDisplay = (display == "none") ? "block" : "none";
	dojo.style(id + "_type", "display", newDisplay);
	
	if (id + "_toggle") {
		var inner = (newDisplay == "none") ? "<img src=\"images\\plus.png\">" : "<img src=\"images\\minus.png\">";
		dojo.byId(id + "_toggle").innerHTML = inner;
	}
	
	var parent = dojo.byId(id).parentNode.id
	if ((parent == "r_threats_spp_type") || (parent == "r_breeding_type") || (parent == "r_invasives_spp_type") || (parent == "r_invasives_status_type")) {
		if (newDisplay == "none") {
			dojo.style(parent, "height", resultsDomNodes[parent] + "px");
		} else {
			if (dojo.style(parent, "height") < 100) {
				dojo.style(parent, "height", "102px");
			} else {
				dojo.style(parent, "height", resultsDomNodes[parent] + "px");
			}
		}
	}
	
	if ((id == "r_threats_spp") || (id == "r_breeding") || (id == "r_invasives_spp") || (id == "r_invasives_status")) {
		switch(id) {
			case "r_threats_spp":
				dojo.style("r_breeding_type", "display", "none");
				break;
			case "r_breeding":
				dojo.style("r_threats_spp_type", "display", "none");
				break;		
			case "r_invasives_spp":
				dojo.style("r_invasives_status_type", "display", "none");
				break;		
			case "r_invasives_status":
				dojo.style("r_invasives_spp_type", "display", "none");
				break;		
		}
		//checkResultsTableOverlap("resultsContentDiv");
	}
	
}

function checkResultsTableOverlap(id) {
	var rDiv = dojo.position(id);
	var tDiv = dojo.position("tableDiv");
	var rBottom = rDiv.y + rDiv.h;
	if (rBottom > tDiv.y) { 
		var h = dojo.style("tableDiv", "height") - (rBottom - tDiv.y + 20);
		if (h > 20) {
			dojo.style("tableDiv", "height", h + "px");
			dijit.byId("tableDiv").getParent().resize();
		} else {
			closeTable();
		}
	}
}

function checkViewPortOverlap(id) {
	var rDiv = dojo.coords(id);
	var mDiv = dojo.coords("mapDiv");
	var rBottom = rDiv.t + rDiv.h;
	var rRight = rDiv.l + rDiv.w
	var bottomOverlap = rBottom - mDiv.h + 10;
	var rightOverlap = rRight - mDiv.w + 5;
	if ((rBottom > mDiv.h) && (rRight > mDiv.w)) { 
		//console.log("overlap: " + (rBottom - mDiv.h))
		dojo.fx.slideTo({ node: id, duration: 150, top: (rDiv.t - bottomOverlap).toString(), left: (rDiv.l - rightOverlap).toString(), unit: "px" }).play();
	} else if (rBottom > mDiv.h) {
		//console.log("overlap: " + bottomOverlap)
		dojo.fx.slideTo({ node: id, duration: 150, top: (rDiv.t - bottomOverlap).toString(), left: (rDiv.l).toString(), unit: "px" }).play();
	}  else if (rRight > mDiv.w) {
		//console.log("overlap: " + rightOverlap)
		dojo.fx.slideTo({ node: id, duration: 150, top: (rDiv.t).toString(), left: (rDiv.l - rightOverlap).toString(), unit: "px" }).play();
	}
}

function openTable() {
	var height = dojo.window.getBox().h - 580;
	if (height > 250) {
		height = 250;
	} else if (height < 100) {
		height = 100;
	}
	dojo.style("tableArrow", "backgroundPosition", "0px 0px");
	dojo.style("tableDiv", "height", height + "px");
	dijit.byId("tableDiv").getParent().resize();
	checkViewPortOverlap("searchContentDiv");
	checkViewPortOverlap("resultsContentDiv");
	checkViewPortOverlap("islandContentDiv");
}

function closeTable() {
	dojo.style("tableArrow", "backgroundPosition", "-14px 0px");
	dojo.style("tableDiv", "height", "0px");
	dijit.byId("tableDiv").getParent().resize();
}

function toggleTable() {
	var h = dojo.style("tableDiv", "height")
	if (h > 1) {
		closeTable();
	} else { 
		openTable();
	}
}

function clearSearchQueryData() {
	closeTable();
	if (tableDownloadUrl != "") {
		resetCsvExport();
	}
	
	dojo.style("tableClose", "display", "none");
	if (dijit.byId("islandsDivGrid") != undefined) {
		dijit.byId("islandsDivGrid").destroyRecursive();
	}
	if (dojo.byId("tableExport") != undefined) {
		destroyTableExportButton()
	}

	if (dijit.byId("i_breeding_tooltip")) { dijit.byId("i_breeding_tooltip").destroyRecursive(); }		
	
	islandPointFeatures.clearSelection();
	islandPointSelectionLayer.clear();
	islandPointHighlightLayer.clear();
	map.graphics.clear();
	map.infoWindow.hide();
	//islandPointFeatures.show();
	map.setExtent(maxExtent);

	searchToolDeactivate();	
	
	currentQuery = "0 = 1";
	
	dojo.style("islandTitle", "display", "block");
	infoDetails.set("content", "");
	infoInvasive.set("content", "");
	
	dijit.byId("infoTabs").selectChild(infoDetails);	
	dijit.byId("infoTabs").domNode.style.display = "none";
	dojo.style("galleryContentDiv", "display", "none");
	
	dijit.byId("infoTabs").selectChild(infoDetails);	
	dijit.byId("infoTabs").domNode.style.display = "none";
	dojo.style("galleryContentDiv", "display", "none");
	
	dojo.byId("islands_sum").innerHTML = 0;
	dojo.byId("invasives_sum").innerHTML = "0 (0";
	dojo.byId("r_invasives_spp_type").innerHTML = "";
	dojo.style("r_invasives_spp_type", { "display": "none", "height": "22px" });
	resultsDomNodes["r_invasives_spp_type"] = 22;
	
	dojo.byId("r_invasives_status_type").innerHTML = "";
	dojo.style("r_invasives_status_type", { "display": "none", "height": "22px" });
	resultsDomNodes["r_invasives_status_type"] = 22;	
	
	dojo.byId("queryDefinition").innerHTML = ((config_byValues.hasOwnProperty('Filter')) ? config_byValues['Filter'] : "Filter") + ": <b>&lt;" + ((config_byValues.hasOwnProperty('None')) ? config_byValues['None'] : "None") + "&gt;</b>";

	var selectBoxs = dojo.query(".dijitComboBox");
	dojo.forEach(selectBoxs, function(box) {
		dijit.byId(box.id.split("_")[1]).set('value', filterSelectAll);
	});
	
	if (dijit.byId("resultsContentDiv").open == true) { dijit.byId("resultsContentDiv").toggle(); }
	if (dijit.byId("searchContentDiv").open == false) { dijit.byId("searchContentDiv").toggle(); }
	if (dijit.byId("islandContentDiv").open == false) { dijit.byId("islandContentDiv").toggle(); }
	//if (dijit.byId("ovContentDiv").open == false) { dijit.byId("ovContentDiv").toggle(); }
	
	dijit.byId("csvButton").set('disabled', true);
	dijit.byId("printButton").set('disabled', true);
	csvString = "";
}

function setHighlightSymbol(graphic) {
	map.graphics.clear();
	islandPointHighlightLayer.clear();
	if (graphic.symbol) { 
		/*//var selectedFeatures = islandPointFeatures.getSelectedFeatures();
		//var symbol = islandPointFeatures.getSelectionSymbol();
		var selectedFeatures = islandPointSelectionLayer.graphics;
		var symbol = selectionSymbol;
		dojo.forEach(selectedFeatures, function(feature) {
			feature.setSymbol(symbol);
		});
		//graphic.setSymbol(highlightSymbol);
		*/
		var pt = new esri.Graphic(graphic.geometry, highlightSymbol, graphic.attributes);
		//map.graphics.add(pt);
		islandPointHighlightLayer.add(pt)
	}
}

function showDefinitions(id, e){
	if (e.shiftKey) { definitions.show() }
	else { toggleSubItem(id) };
}