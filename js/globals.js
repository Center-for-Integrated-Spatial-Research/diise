dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.TitlePane");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ComboButton");
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.Tooltip");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.Dialog");
dojo.require("dijit.ProgressBar");
dojo.require("dijit.focus");

dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.DeferredList");
dojo.require("dojo.NodeList-traverse");
dojo.require("dojo.fx");
dojo.require("dojo.fx.easing");
dojo.require("dojo.dnd.move");
dojo.require("dojo.date.locale");

dojo.require("dojox.grid.DataGrid");
//dojo.require("dojox.grid.EnhancedGrid");
//dojo.require("dojox.grid.enhanced.plugins.NestedSorting");
//dojo.require("dojox.grid.enhanced.plugins.Filter");
//dojo.require("dojox.grid.enhanced.plugins.exporter.CSVWriter");
dojo.require("dojox.fx");
dojo.require("dojox.xml.parser");
dojo.require('dojox.image.Gallery');
dojo.require("dojox.widget.AutoRotator");
dojo.require("dojox.widget.rotator.Fade");
dojo.require("dojox.charting.Chart2D");
dojo.require("dojox.charting.action2d.Tooltip");
dojo.require("dojox.charting.themes.Algae");
dojo.require("dojox.lang.functional");
dojo.require("dojox.validate");

dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.tasks.query");
dojo.require("esri.tasks.geometry");
dojo.require("esri.toolbars.navigation");
dojo.require("esri.toolbars.draw");
dojo.require("esri.dijit.Popup");
dojo.require("esri.dijit.OverviewMap");
dojo.require("esri.utils");
dojo.require("esri.tasks.gp");

var corsServer = "arcgis.cisr.ucsc.edu";
var map;
var baseMapLayer;
var baseMapLayerUrl = "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer";
var imageryLayer;
var imageryLayerUrl = "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer";
var ovMapLayer;
var ovMapLayerUrl = "http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer";
var islandPointFeatures;
var islandPointFeaturesUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/IC/diise_2015_02_05/MapServer/0";
var threatenedSppTable;
var threatenedSppTableUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/IC/tib_2015_02_06/MapServer/1";
var threatenedSppIslandTable;
var numThreatenedSpp = 0;
var breedingData
var redListData
var invasiveSppTable;
var invasiveSppTableUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/IC/diise_2015_02_05/MapServer/1";
var invasiveSppIslandTable;
var eradicationReferencesUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/IC/diise_2015_02_05/MapServer/2";
var eradicationReferencesTable;
var numInvasiveSpp = 0
var numZeroInvasiveSpp = 0;
var tibFeaturesUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/IC/tib_2015_02_06/MapServer/0";
var threatData;
var threatFilter = [];
var threatStatusFilter = [];
var invasiveData;
var invasiveResults;
var invasiveStatusData;
var invasiveFilter = [];
var islandPointSelectionLayer;
var islandPointHighlightLayer;
var islandSymbol;
var highlightSymbol;
var selectionSymbol;
var navigationTool;
var initialExtent;
var maxExtent;
var tooltip;
var drawtoolbar;
var queryDefinition = [];
var invasiveSppImages = {};
var tibIslands = {};
var resultsDomNodes = {"r_threats_spp_type" : 22, "r_breeding_type" : 22, "r_invasives_spp_type" : 22, "r_invasives_status_type": 22 }
var activeSearch = "sql";
var currentQuery = "0 = 1";
var appLoaded = [];
var allLayersLoaded = 4;
var urlQueryParams;
var gp;
var printUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/IC/ic_print/GPServer/Print%20Custom%20Web%20Map";
var exportUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/TOOLS/ConvertStringToCSV/GPServer/Convert String to CSV";
var emailUrl = "http://arcgis.cisr.ucsc.edu/arcgis/rest/services/IC/DIISE_Email_Request/GPServer/DIISE%20Email%20Request";

var islandPointFeaturesFields = ["OBJECTID", "Island_GID_Code", "Island_Name", "Region_ID_Name", "Country", "Region_Archipelago", "Corrected_Latitude", "Corrected_Longitude", "Corrected_Area_KM2", "Human_Habitation_Category"];
var invasiveSppIslandFields = ["OBJECTID", "EradicationID", "Invasive_Species", "Scientific_Name", "InvasiveTypeCorrected", "Year_of_Introduction", "Data_Quality", "Eradication_Start_Date", "Eradication_End_Date", "Eradication_Status", "Island_Eradication_Type", "Primary_Eradication_Method", "Secondary_Eradication_Method", "Tertiary_Eradication_Method", "Primary_Baiting_Method", "Secondary_Baiting_Method", "Primary_Toxicant", "Secondary_Toxicant", "Contact_Name", "Contact_Organization", "Organization_Website", "Island_GID_Code"];
var recordSpeciesDetailFields = ["Invasive_Species", "Scientific_Name", "InvasiveTypeCorrected", "Year_of_Introduction"];
var recordLocationDetailFields = ["Island_GID_Code", "Island_Name", "Region_ID_Name", "Country", "Region_Archipelago", "Corrected_Latitude", "Corrected_Longitude", "Corrected_Area_KM2", "Human_Habitation_Category"];
var recordEradicationDetailFields = ["Data_Quality", "Eradication_Start_Date", "Eradication_End_Date", "Eradication_Status", "Island_Eradication_Type", "Primary_Eradication_Method", "Secondary_Eradication_Method", "Tertiary_Eradication_Method", "Primary_Baiting_Method", "Secondary_Baiting_Method", "Primary_Toxicant", "Secondary_Toxicant"];
var recordContactDetailFields = ["Contact_Name", "Contact_Organization", "Organization_Website"];
var eradicationReferencesFields = ["Island_Eradication_ID", "Reference_Type", "Reference_Full_Clean", "OnlineAddress"];
var tableFields = ["OBJECTID", "Invasive_Species", "Scientific_Name", "InvasiveTypeCorrected", "Eradication_Status", "Primary_Eradication_Method", "Eradication_End_Date", "Island_GID_Code", "Island_Name", "Region_Archipelago", "Country", "Region_ID_Name", "Corrected_Area_KM2", "Human_Habitation_Category"]

var filterSelectAll = " -- all -- ";
var islandPointsIslandID = "Island_GID_Code";
var islandPointsName = "Island_Name";
var invasiveSppIslandID = "Island_GID_Code";
var invasiveSppID = "Invasive_Species";
var eradicationID = "EradicationID";

var redListSelectOrder = [filterSelectAll, "EW", "CR", "EN", "VU"];
var invasiveTypeSelectOrder = [filterSelectAll, "Rodent", "Ungulate", "Cat", "Rabbit and Hare", "Mongoose and Weasel", "Primate", "Dog and Fox", "Mammal (Other)", "Amphibian", "Reptile", "Reptile (Snake)", "Bird", "Bird (Raptor)", "Fish", "Invertebrate", "None", "Unknown"];

var redListDefs = [
["lc","Least Concern"],
["nt","Not Threatened"],
["vu","Vulnerable"],
["en","Endangered"],
["cr","Critically Endangered"],
["ew","Extinct in the Wild"],
["ex","Extinct"]
];

var presentBreedingStatusDefs = [
["confirmed", "(Present) Species is confirmed to breed on the island"],
["probable", "(Present) Breeding is not confirmed but is suspected based on a number of factors or evidence"],
["potential", "(Present) Species recorded as past breeder on the island, but current status is unclear"],
["data_deficient", "(Present) Breeding status not updated in past 20 years OR not enough data to extrapolate exact breeding island location"],
["extirpated", "(Present) Confirmed extirpated from the island"],
["extinct", "(Present) Currently listed as EX or EW by IUCN"],
["introduced", "(Present) Species introduced to an island outside of its native range or archipelago"]
];

var historicBreedingStatusDefs = [
["confirmed", "(Historic) Species is confirmed to have bred on the island"],
["probable", "(Historic) Breeding is not confirmed but is suspected based on a number of factors or evidence"],
["potential", "(Historic) Breeding status is unclear (inconclusive surveys or data)"],
["data_deficient", "(Historic) No record or history of species on island in past 21 – 200 years"],
["na", "(Historic) Species is listed as Confirmed for Present Breeding Status"],
["introduced", "(Historic) Species was introduced to an island outside of its native range or archipelago"]
];

var arkiveURL = "http://www.arkive.org/api/C1QL4332G0/portlet/latin/[SPECIES_NAME]/1?media=images";
var iucnRedListUrl = "http://www.iucnredlist.org/apps/redlist/search/external?text=";
var iucnInvasiveUrl = "http://www.issg.org/database/species/search.asp?sts=sss&st=sss&fr=1&x=33&y=4&sn=[SPECIES_NAME]&rn=&hci=-1&ei=-1&lang=EN";
var icEradicationUrl = "http://eradicationsdb.fos.auckland.ac.nz/pages/search/default.aspx?i=";
var birdLifeUrl = "http://www.birdlife.org/datazone/speciesfactsheet.php?id=[SPECIES_NAME]"
var tibUrl = "http://tib.islandconservation.org"
var pdfDownloadUrl = "";
var tableDownloadUrl = "";
var csvString = "";
var language = "en";
var splashResize;
var csvTerms = false;
var printTerms = false;
var chart;

var terms_userName;
var terms_email;
var terms_org;
var terms_country;
var terms_purpose;