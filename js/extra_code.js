		/*
		threatenedSppIslandTable.queryFeatures(query, function(records) {
			
			// prepare data for client-side join of attributes
			var p_data = records.features
			var f_data = threatenedSppTable.graphics
			var p_attributes = dojo.map(p_data, function(feature){ return feature.attributes; });
			var f_attributes = dojo.map(f_data, function(feature){ return feature.attributes; });
			var p_fields = records.fields;
			var f_fields = [];
			dojo.forEach(threatenedSppTable._outFields, function(field) { 
				dojo.some(threatenedSppTable.fields, function(f){
					if (field == f.name) { f_fields.push(f) }
				});
			});
			var data = joinFeatureAttributes(p_attributes, f_attributes, p_fields, f_fields, oid, "Threatened_Species", "SpeciesID");
			
			populateDataTable(data.attributes, oid, data.fields, "threatenedDivContent", "threatenedDivGrid");
			
		});
		*/
		
 /*
function populateDataTable(records, oid, domNode, id){	
	if (dijit.byId(id) != undefined) {
		dijit.byId(id).destroy();
	}
	var items = dojo.map(records.features,function(feature){
		return feature.attributes;
	});
	
	var data = {
		identifier: oid,
		label: oid,
		items:items
	};
	
	var store = new dojo.data.ItemFileReadStore({data:data});

	// Set up dojox grid structure
	var columns = [];
	dojo.forEach(records.fields, function(field){
		if (field.name != oid) {
			var width = (field.alias.length * 7) + 'px'
			var column = { 'name': field.alias, 'field': field.name, 'width':width };
			columns.push(column);
		}
	});
	
	// create the new dojox grid
	dataTable = new dojox.grid.DataGrid({
		id: id,
		store: store,
		structure: columns,
		loadingMessage: "Data loading...",
		rowSelector: '20px'
	}, document.createElement('div'));

	// append the new grid to the div "islandsDivContent":
	dijit.byId(domNode).domNode.appendChild(dataTable.domNode);

	// Call startup, in order to render the grid:
	dataTable.startup();
	dataTable.resize();
	dataTable.update();
	dojo.style("progressBarDiv", { "display":"none" });
	
}
*/

/*
function joinFeatureLayers(p_layer, f_layer, p_key, f_key) {

	var fields = f_layer.fields;
	
	dojo.forEach(fields, function(field){
		p_layer.fields.push(field);
	});
	
	var outFields = dojo.map(f_layer.fields, function(field){
		return field.name
	});
	p_layer._outFields = outFields
		
	dojo.forEach(p_layer.graphics, function(f){
		var id = f.attributes[p_key];
		
		var attr;
		dojo.some(f_layer.graphics, function(g){
			if ( id == g.attributes[f_key] ) {
				attr = g.attributes;
			}
		});
		
		i = 0;
		for (item in attr) {
			f.attributes[fields[i].name] = attr[fields[i].name];
			i += 1;
		};
	});

}
*/	



	dojo.connect(dijit.byId("searchContentDiv"), "toggle", function (){
		  /*
		  var state = this.open;
		  // state == true means the title pane is actually closed here
		  if (state == true) {
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: 350 }).play();
		  } else {
			dojox.fx.wipeTo({ node: this.id, duration: 150, width: 75 }).play();		
		  } 
		  */
	}); 
	
	dojo.connect(dijit.byId("summaryContentDiv"), "toggle", function (){
		  /*
		  var state = this.open;
		  // state ==true means the title pane is closed here
		  if (state == true) {
			dojo.fx.combine([
				dojox.fx.wipeTo({ node: this.id, duration: 200, width: 300 }),
				dojo.fx.slideTo({ node: "summaryDiv", duration: 200, top: dojo.marginBox("summaryDiv").t.toString(), left: (dojo.marginBox("summaryDiv").l + dojo.marginBox("summaryDiv").w - 300 ).toString(), unit: "px" })
			]).play();
		  } else {
			dojo.fx.combine([
				dojox.fx.wipeTo({ node: this.id, duration: 200, width: 75 }),
				dojo.fx.slideTo({ node: "summaryDiv", duration: 200, top: dojo.marginBox("summaryDiv").t.toString(), left: (dojo.marginBox("summaryDiv").l + dojo.marginBox("summaryDiv").w + 150).toString(), unit: "px" })
			]).play();			
		  } 
			*/
	});
	
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