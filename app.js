var baseUrl = 'https://rest.ehrscape.com/rest/v1';

var username = "ois.seminar";
var password = "ois4fri";

var element;

var Patient_ID  = [0, 0, 0];
var Patient_BMI = [0, 0, 0];

var Doctor_Name = ['Grant', 'Kathleen', 'Kevin', 'Kenneth', 'Janice'];
var Doctor_Surn = ['Anderson', 'Jones', 'Reynolds', 'Ross', 'Brown'];
var Doctor_Loca = ["Zaloska Cesta 2 Ljubljana", "Krziceva 10 Ljubljana", "Zaloska Cesta 2 Ljubljana", "Krziceva 10 Ljubljana", "Krziceva 10 Ljubljana"];

var Array_A = ["Nick", "Abraham", "Maseo"];
var Array_B = ["Burkhardt", "Setrakian", "Yamashiro"];
var Array_C = ["1978-06-18T16:10", "1936-08-26T10:30", "1975-01-21T23:50"];
var Array_D = ["MALE", "MALE", "MALE"];

// Nick Burkhardt    --> Condition: OK                     --> BMI Last Range: 21-26
// Abraham Setrakian --> Condition: Severe [Weight - Lose] --> BMI Last Range: 13-15
// Maseo Yamashiro   --> Condition: Severe [Weight - Gain] --> BMI Last Range: 30-40


var sessionId;

function getSessionId () {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function patients () {
	geload();
	element = document.getElementById("Info");
	element.innerHTML = '';
	graph_list ();
	generator (0);
	generator (1);
	generator (2);
}

function graph_list () {
	element = document.getElementById("graphicals");
	element.innerHTML = '';
	var graph_opt;
	graph_opt = "<option class=\"Info\" value=\"" + "/body_temperature" + "\">" + "Temperature"  + "</option>";
	$("#graphicals").append(graph_opt);

/*
	graph_opt = "<option class=\"Info\" value=\"" + "bmi-eu" + "\">" + "BMI EU"  + "</option>";
	$("#graphicals").append(graph_opt);
	graph_opt = "<option class=\"Info\" value=\"" + "bmi-slo" + "\">" + "BMI SLO"  + "</option>";
	$("#graphicals").append(graph_opt);
	graph_opt = "<option class=\"Info\" value=\"" + "/weight" + "\">" + "Weight"  + "</option>";
	$("#graphicals").append(graph_opt);
	graph_opt = "<option class=\"Info\" value=\"" + "/height" + "\">" + "Height"  + "</option>";
	$("#graphicals").append(graph_opt);
*/

}

function generator (i) {
	sessionId = getSessionId();
	var Name    = Array_A [i];
	var Surname = Array_B [i];
	var Birth   = Array_C [i];
	var Gendre  = Array_D [i];
	var ehrId;
		
	$.ajaxSetup({
		headers: {"Ehr-Session": sessionId}
	});
	$.ajax({
		url: baseUrl + "/ehr",
		type: 'POST',
		success: function (data) {
		ehrId = data.ehrId;
		Patient_ID [i] = ehrId;
			var partyData = {
				firstNames: Name,
				lastNames: Surname,
				dateOfBirth: Birth,
				gender: Gendre,
				partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
			};
			$.ajax ({
				url: baseUrl + "/demographics/party",
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(partyData),
				success: function (party) {
					if (party.action == 'CREATE') {
						var Info = "<option class=\"Info\" value=\"" + Patient_ID [i] + "\">" + Name + " " + Surname + "</option>";
						$("#Info").append(Info);
						addData(i);
					}
				},
				error: function(err) {
					$("#Info").html("<span class='message label label-danger fade-in'>Error '" + JSON.parse(err.responseText).userMessage + "'!");
				}
			});
		}
	});
}

function addData(i) {
	var BirthDate = Array_C [i];
	BirthDate = BirthDate.split("-");
	var Year = BirthDate[0];
	var Period = 2014 - Year - 20;
	BirthDate = BirthDate.join("-");
	var Height;
	var Weight;
	
	if (i === 0) {
		Height = (Math.random() * 10) + 178.9;
		Weight = (Math.random() *  3) + 78.6;
	}
	
	if (i == 1) {
		Height = (Math.random() * 12) + 168.8;
		Weight = (Math.random() *  5) + 72.1;
	}
	
	if (i == 2) {
		Height = (Math.random() * 10) + 173.3;
		Weight = (Math.random() *  7) + 82.8;
	}
	
	for(var j = 1; j <= Period; j++){
		BirthDate     = BirthDate.split("-");
		var DateOfYear = parseInt(BirthDate[0]);
		BirthDate[0] = (DateOfYear + j + 20).toString();
		BirthDate     = BirthDate.join("-");
		var DateAndTime = BirthDate;
		BirthDate     = BirthDate.split("-");
		BirthDate [0] = BirthDate[0] - j - 20;
		BirthDate     = BirthDate.join("-");
		var Temp = (Math.random() * 40);
		var BodyTemp;
		
		if (i === 0) {
			Height = Height + (Math.random() * 2 );
			Height = Height - (Math.random() * 2 );
			Weight = Weight + (Math.random() * 2 );
			Weight = Weight - (Math.random() * 2 );
		}
		else if (i == 1) {
			Height = Height + (Math.random() * 1 );
			Height = Height - (Math.random() * 1 );
			Weight = Weight - (Math.random() * (j / 30));
		}
		else if (i == 2) {
			Height = Height + (Math.random() * 1 );
			Height = Height - (Math.random() * 1 );
			Weight = Weight + (Math.random() * (j / 3));
		}
			
		if (j == Period) {
			Patient_BMI[i] = ((Weight * 10000) / (Height * Height));
		}
		if (j < 3) {
			if (Temp > 37) {
				BodyTemp = (37 + (Math.random() * 2)); // Max: 40-36
				
			}
			else {
				BodyTemp = (37 - (Math.random() * 3)); // Min: 35-37
			}
		}
		else {
			if (Temp > 37) {
				BodyTemp = (37 + (Math.random() * 1)); // Max: 40-36
				
			}
			else {
				BodyTemp = (37 - (Math.random() * 2)); // Min: 35-37
			}
		}
			
		Temp = Math.floor(Math.random() + 1);
		var SysPressure = Math.floor(105 + (Math.random() * 30));
		var DysPressure = Math.floor( 75 + (Math.random() * 20));
		var Oxydation   = Math.floor(100 - (Math.random() * 7));
			
		$.ajaxSetup({
			headers: {"Ehr-Session": sessionId}
		});
		var data = {
			"ctx/language": "en",
			"ctx/territory": "SI",
			"ctx/time": DateAndTime,
			"vital_signs/height_length/any_event/body_height_length": Height,
			"vital_signs/body_weight/any_event/body_weight": Weight,
			"vital_signs/body_temperature/any_event/temperature|magnitude": BodyTemp,
			"vital_signs/body_temperature/any_event/temperature|unit": "°C",
			"vital_signs/blood_pressure/any_event/systolic": SysPressure,
			"vital_signs/blood_pressure/any_event/diastolic": DysPressure,
			"vital_signs/indirect_oximetry:0/spo2|numerator": Oxydation
		};
		var requestParameters = {
			"ehrId": Patient_ID[i],
			templateId: 'Vital Signs',
			format: 'FLAT',
		};
		$.ajax({
			url: baseUrl + "/composition?" + $.param(requestParameters),
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(data),
		});
	}
}

function displayLocation () {
	var mapOptions = {
		zoom: 8,
		center: new google.maps.LatLng(46.086283, 14.511189),
		mapTypeId: google.maps.MapTypeId.ROADMAP };
		var map = new google.maps.Map($("#map-container").get(0),mapOptions);
		var geocoder = new google.maps.Geocoder();
		var address = "Zaloska Cesta 2 Ljubljana";
		geocoder.geocode({address:address},function(results) {
		new google.maps.Marker({position:results[0].geometry.location,map:map});
	});
}

/*
var lon;
var lat;

function displayLocations () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

function showPosition(position) {
    lat = position.coords.latitude; 
    lon = position.coords.longitude;
    showMaps();
}

function showMaps () {
	var mapOptions = {
		zoom: 8,
		center: new google.maps.LatLng(46.086283, 14.511189),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map($("#map-container").get(0),mapOptions);
	var geocoder = new google.maps.Geocoder();
	
	var address1 = Doctor_Loca[0];
	geocoder.geocode({address:address1},function(results) {
		lat = results[0].geometry.location.lat;
		lng = results[0].geometry.location.lng;
	    new google.maps.Marker({position:results[0].geometry.location,map:map});
    });
    
    var address2 = new google.maps.LatLng(lat, lon);
    geocoder.geocode({address:address2},function(results) {
		new google.maps.Marker({position:results[0].geometry.location,map:map});
    });
}
*/

function displayInfo () {
	clean_info();
	var FID = document.getElementById("Info");
	var SID = FID.options[FID.selectedIndex].value;
	var IND = 0;
	sessionId = getSessionId();
		
	for (var n = 0; n <= 2; n++) {
		if (SID == Patient_ID[n]) {
			IND = n;
		}
	}
		
	if( SID.length < 1){
		return;
	}

	$.ajax({
		url: baseUrl + "/demographics/ehr/" + SID + "/party",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (data) {
			var party = data.party;
			
			var patient = "<img src=\"pics/patient.png\" id=\"patient\">";
			$("#patient-pic").append(patient);
				
			var name = "<p class=\"style_04\">" + party.firstNames + ' ' + party.lastNames + "</p>";
			$("#data").append(name);
				
			var birth = party.dateOfBirth.split("T");
			var date = birth[0];
			var time = birth[1];
			time =  time.substring(0, 5);
			birth = "<p class=\"style_02\"><b> Birth: </b><span class=\"style_02\">" + date + " at " + time + "</span></p>";
			$("#data").append(birth);
				
			var gender = "<p class=\"style_02\"><b> Gendre: </b> <span class=\"style_02\">" + party.gender + "</span> </p>";
			$("#data").append(gender);
				
			var nurse = "<img src=\"pics/nurse.png\" id=\"nurse\">";
			$("#nurse-pic").append(nurse);
			
			var doctor = "<p class=\"style_04\">" + "Dr. " +  Doctor_Name[0] + " " + Doctor_Surn[0] + "</p>";
			$("#doc_name").append(doctor);
			
			var location = "<p class=\"style_04\">" + Doctor_Loca[0] + "</p>";
			$("#doc_loca").append(location);

			displayLocation ();
			displayGraphs();
		},
		error: function(err) {
			return;
		}
	});
	$.ajax({
		url: baseUrl + "/view/" + SID + "/height",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (res) {
			for (var x = 0; x < 1; x++) {
				var value = Math.round(res[x].height * 10) / 10;
				var Height = "<div class=\"style_08\">" + value + " " + res[x].unit + "</div>";
				$("#height").append(Height);
			}
		},
		error: function(err) {
			return;
		}
	});
	$.ajax({
		url: baseUrl + "/view/" + SID + "/weight",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (res) {
			for (var x = 0; x < 1; x++) {
				var value = Math.round(res[x].weight * 10) / 10;
				var Weight = "<p class=\"style_08\">" + value + " " + res[x].unit + "</p>";
				$("#weight").append(Weight);
			}
		}
	});
	var body = Math.round(Patient_BMI[IND] * 10) / 10;
	var BMI = "<p class=\"style_08\">" + body + " kg/m2" + "</p>";
	$("#bmi").append(BMI);
	$.ajax({
		url: baseUrl + "/view/" + SID + "/blood_pressure",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (res) {
			for (var x = 0; x < 1; x++) {
				var Pressure = "<p class=\"style_09\">" + res[x].diastolic + " || " + res[x].systolic + " mm[Hg]" + "</p>";
				$("#pressure").append(Pressure);
			}
		}
	});
	$.ajax({
		url: baseUrl + "/view/" + SID + "/spO2",
		type: 'GET',
		headers: {
			"Ehr-Session": sessionId
		},
		success: function (res) {
			for (var x = 0; x < 1; x++) {
				var Oxydation = "<p span class=\"style_09\">" + res[x].spO2 + " %" + "</span> </p>";
				$("#oxydation").append(Oxydation);
			}
		}
	});
	reload();
}

function reload () {
	$("#hidden_1").css("visibility", "visible");
	$("#hidden_2").css("visibility", "visible");
	$("#hidden_3").css("visibility", "visible");
	$("#hidden_4").css("visibility", "visible");
}

function geload () {
	$("#hidden_1").css("visibility", "hidden");
	$("#hidden_2").css("visibility", "hidden");
	$("#hidden_3").css("visibility", "hidden");
	$("#hidden_4").css("visibility", "hidden");
}

function clean_info () {
	element = document.getElementById("patient-pic");
	element.innerHTML = '';
	element = document.getElementById("data");
	element.innerHTML = '';
	element = document.getElementById("nurse-pic");
	element.innerHTML = '';
	element = document.getElementById("doc_name");
	element.innerHTML = '';
	element = document.getElementById("doc_loca");
	element.innerHTML = '';
	element = document.getElementById("height");
	element.innerHTML = '';
	element = document.getElementById("weight");
	element.innerHTML = '';
	element = document.getElementById("bmi");
	element.innerHTML = '';
	element = document.getElementById("pressure");
	element.innerHTML = '';
	element = document.getElementById("oxydation");
	element.innerHTML = '';
}

function clean_graph () {
	element = document.getElementById("graph");
	element.innerHTML = '';
}

function clean_anali () {
	element = document.getElementById("analithics");
	element.innerHTML = '';
}

function displayGraphs () {
	clean_graph();
	clean_anali();
	var FID = document.getElementById("Info");
	var SID = FID.options[FID.selectedIndex].value;
	var LID = document.getElementById("graphicals");
	var GID = LID.options[LID.selectedIndex].value;
		
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
		
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);
			
	var y = d3.scale.linear()
		.range([height, 0]);
		
	var svg = d3.select("#graph").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	if (GID == "/body_temperature") {
		var AQL = "select " +
				"t/data[at0002]/events[at0003]/time/value as time, " +
				"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperature, " +
				"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as unit " +
				"from EHR e[e/ehr_id/value='" + SID + "'] " +
				"contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1] " +
				"where t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude>37 " +
				"order by t/data[at0002]/events[at0003]/time/value desc ";
		$.ajax({
			url: baseUrl + "/query?" + $.param({"aql": AQL}),
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
			success: function (res) {
				var resultSetA = res.resultSet;
				if( resultSetA.length > 0){
				var fever = "<p class=\"style_04\">Count [37.0+] = " + resultSetA.length +  "</p>" ;
					$("#analithics").append(fever);
				}
			}
		});
		var UND = "select " +
				"t/data[at0002]/events[at0003]/time/value as time, " +
				"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperature, " +
				"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as unit " +
				"from EHR e[e/ehr_id/value='" + SID + "'] " +
				"contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1] " +
				"where t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude<35 " +
				"order by t/data[at0002]/events[at0003]/time/value desc ";
		$.ajax({
			url: baseUrl + "/query?" + $.param({"aql": UND}),
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
			success: function (res) {
				var resultSetB = res.resultSet;
				if( resultSetB.length > 0){
					var hypo = "<p class=\"style_04\">Count [35.0-] = " + resultSetB.length + "</p>" ;
					$("#analithics").append(hypo);
				}
			}
		});
		var ALL = "select " +
				"t/data[at0002]/events[at0003]/time/value as time, " +
				"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperature, " +
				"t/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/units as unit " +
				"from EHR e[e/ehr_id/value='" + SID + "'] " +
				"contains OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1] " +
				"order by t/data[at0002]/events[at0003]/time/value desc ";
		$.ajax({
			url: baseUrl + "/query?" + $.param({"aql": ALL}),
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
			success: function (res) {
				var resultSetC = res.resultSet;
				if (res) {
					x.domain(resultSetC.map(function(d) {  return d.time; }));
					y.domain([0, d3.max(resultSetC, function(d) { return d.temperature; })]);
						
					svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")");
						
					svg.append("g")
					.attr("class", "y axis")
					.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 6)
					.attr("dy", ".71em")
					.style("text-anchor", "end");
						
					svg.selectAll(".bar")
					.data(resultSetC)
					.enter().append("rect")
					.attr("class", "bar")
					.attr("x", function(d) { return x(d.time); })
					.attr("width", x.rangeBand())
					.attr("y", function(d) { return y(d.temperature); })
					.attr("height", function(d) { return height - y(d.temperature); });
				}
			}
		});
	}
}

function channelVideo () {

	$.support.cors= true;
	$("#video").html("");
	$("#options").html("");

	var channel="";
	if ($("#schannel").val() !== "") {
		channel=$("#schannel").val();
	}
	else {
		channel="WHO";
	}
	var url = "http://gdata.youtube.com/feeds/api/users/"+ channel + "/uploads?&max-results=5&alt=json";

	$.getJSON(url,function(data) {
		$.each(data.feed.entry,function(i,item) {
			var url=item.media$group.media$content[0].url;
			var title=item.title.$t;
			var datepublished=item.published.$t.substring(0,10);
			var author=item.author[0].name.$t;
			var text="<style_10><a href='#' title='" + url + "'>" + title + "</a></style_10><br>" + "<style_00>Published: " + datepublished + " By " + author + "</style_00>";
			$("#options").append(text);
			$("#options").append("<hr>");
		});
		
		$("a").click(function() {
			var url = $(this).attr("title");
			var text = "<object>" + "<param name='movie' value='" + url + "'></param>" + "<param name='allowFullScreen' value='true'></param>" + "<embed src='" + url + "' type='application/x-shockwave-flash' allowfullscreen='true'></embed>" + "</object>";
			$("#video").append(text);
		});
	});
}
