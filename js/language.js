var config_byValues = config_byValues_en;
var config_byDijitId = config_byDijitId_en;
var config_byId = config_byId_en;

function resetForLanguageUpdate(type){
	language = type;
	if (language == "en") {
		config_byValues = config_byValues_en;
		config_byDijitId = config_byDijitId_en;
		config_byId = config_byId_en;
		
		//dojo.style("help", "width", "105px");
		dojo.style("helpSelectorOptions", { "width" : "108px", "left" : "5px" });
		//dojo.style("link_language_options", "width", "60px");
		dojo.style("topLeftDiv", { "width":"340px", "backgroundImage": "url(../images/diise_text_en.png)" });
		dojo.style("extentSelect", { "width": "100px", "left":"78px" });
		dojo.style("polySelect",{ "width": "100px", "left":"198px" });
		dojo.forEach(dojo.query(".drawToolText"), function(d) { dojo.style(d, "width", "75px") });
		if (dojo.byId("splashOverlay")) {
			dojo.style("exploreMap", "background", "url(../images/splash/exploreMap_en.png)");
			dojo.byId("exploreMapHover_image").src = "images/splash/exploreMapHover_en.png";
			dojo.forEach(dojo.query(".splashImage"), function(d){
				var image = dojo.style(d.id, "backgroundImage").replace("_es", "_en");
				dojo.style(d.id, "backgroundImage", image);
			});
			dojo.style("slideShowNav", "bottom", "74px");
		}		
	}
	
	if (language == "es") {
		config_byValues = config_byValues_es;
		config_byDijitId = config_byDijitId_es;
		config_byId = config_byId_es;
		
		//dojo.style("help", "width", "170px");
		dojo.style("helpSelectorOptions", { "width" : "170px", "left" : "-57px" });
		//dojo.style("link_language_options", "width", "50px");
		dojo.style("topLeftDiv", { "width":"900px", "backgroundImage": "url(../images/diise_text_es.png)" });
		dojo.style("extentSelect", { "width": "125px", "left":"55px" });
		dojo.style("polySelect",{ "width": "120px", "left":"185px" });
		dojo.forEach(dojo.query(".drawToolText"), function(d) { dojo.style(d, "width", "100px") });
		if (dojo.byId("splashOverlay")) {
			dojo.style("exploreMap", "background", "url(../images/splash/exploreMap_es.png)");
			dojo.byId("exploreMapHover_image").src = "images/splash/exploreMapHover_es.png";
			dojo.forEach(dojo.query(".splashImage"), function(d){
				//console.log(dojo.style(d.id, "backgroundImage").split("_"));
				var image = dojo.style(d.id, "backgroundImage").replace("_en", "_es");
				dojo.style(d.id, "backgroundImage", image);
			});
			dojo.style("slideShowNav", "bottom", "63px");
		}
	}

	updateBaseLanguage();
	updateFilterSelectLanguage();
	
	dojo.cookie("language", language, {expires: 365, path: "/" })
}

function getLanguageCookie(){
	var cookie = dojo.cookie("language");
	if (cookie) { language = cookie; }
	return language;
}

function updateBaseLanguage() {
	for (var d in config_byDijitId) {
		var widget = dijit.byId(d);
		if (widget) {
			if ((widget.declaredClass == 'dijit.TitlePane') || (widget.declaredClass == "dijit.layout.ContentPane") || (widget.declaredClass == "dijit.Dialog")) {
				var property = "title";
			} 
			if ((widget.declaredClass == 'dijit.form.Button') || (widget.declaredClass == 'dijit.Tooltip') || (widget.declaredClass == 'dijit.form.RadioButton') || (widget.declaredClass == 'dijit.form.CheckBox')) {
				var property = "label";
			}
			var value = config_byDijitId[d];
			widget.set(property, value);
			
			if (widget.declaredClass == 'dijit.form.ValidationTextBox') {
				dojo.query('#widget_' + d + ' .dijitPlaceHolder')[0].innerHTML = value;
			}
		}
	}
	
	for (var id in config_byId) {
		if (dojo.byId(id)) {
			dojo.byId(id).innerHTML = config_byId[id];
		}
	}
	
	if (chart) {
		chart.getAxis("x").opt.title = config_byValues["chart: x-axis"];
		chart.getAxis("y").opt.title = config_byValues["chart: y-axis"];
		chart.resize(575, 300);
	}
}

function updateFilterSelectLanguage() {
	var selectBoxs = dojo.query(".dijitComboBox");
	dojo.forEach(selectBoxs, function(box) {
		var widget = dijit.byId(box.id.split("_")[1])
		var data = widget.get("store");
		dojo.forEach(data._arrayOfAllItems, function(d) {
			d.name[0] = (config_byValues.hasOwnProperty(d.id[0])) ? config_byValues[d.id[0]] : d.id[0];
		});
		widget.set('value', filterSelectAll);
	});
}